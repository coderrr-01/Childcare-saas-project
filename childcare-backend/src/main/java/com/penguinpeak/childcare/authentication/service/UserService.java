package com.penguinpeak.childcare.authentication.service;

import com.penguinpeak.childcare.authentication.dto.request.CreateUserRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateProfileRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateUserRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateUserStatusRequest;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.entity.Role;
import com.penguinpeak.childcare.authentication.entity.User;
import com.penguinpeak.childcare.authentication.entity.UserCentreMembership;
import com.penguinpeak.childcare.authentication.entity.UserOrganisationMembership;
import com.penguinpeak.childcare.authentication.mapper.UserMapper;
import com.penguinpeak.childcare.authentication.repository.RoleRepository;
import com.penguinpeak.childcare.authentication.repository.UserCentreMembershipRepository;
import com.penguinpeak.childcare.authentication.repository.UserOrganisationMembershipRepository;
import com.penguinpeak.childcare.authentication.repository.UserRepository;
import com.penguinpeak.childcare.common.exception.ConflictException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserOrganisationMembershipRepository organisationMembershipRepository;
    private final UserCentreMembershipRepository centreMembershipRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ConflictException("A user with this email already exists.");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setActive(true);

        Set<Role> roles = resolveRoles(request.roles());
        user.setRoles(roles);

        User saved = userRepository.save(user);

        if (request.organisationId() != null) {
            UserOrganisationMembership membership = new UserOrganisationMembership();
            membership.setUser(saved);
            membership.setOrganisationId(request.organisationId());
            membership.setDefaultMembership(true);
            organisationMembershipRepository.save(membership);
        }

        if (request.centreId() != null) {
            UserCentreMembership membership = new UserCentreMembership();
            membership.setUser(saved);
            membership.setCentreId(request.centreId());
            membership.setDefaultMembership(true);
            centreMembershipRepository.save(membership);
        }

        Long orgId = request.organisationId();
        Long centreId = request.centreId();
        return userMapper.toResponse(saved, orgId, centreId);
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        User user = find(id);
        Long orgId = resolveDefaultOrganisationId(user.getId());
        Long centreId = resolveDefaultCentreId(user.getId());
        return userMapper.toResponse(user, orgId, centreId);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(user -> {
            Long orgId = resolveDefaultOrganisationId(user.getId());
            Long centreId = resolveDefaultCentreId(user.getId());
            return userMapper.toResponse(user, orgId, centreId);
        });
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = find(id);
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        User saved = userRepository.save(user);
        Long orgId = resolveDefaultOrganisationId(saved.getId());
        Long centreId = resolveDefaultCentreId(saved.getId());
        return userMapper.toResponse(saved, orgId, centreId);
    }

    @Transactional
    public UserResponse updateStatus(Long id, UpdateUserStatusRequest request) {
        User user = find(id);
        user.setActive(request.active());
        User saved = userRepository.save(user);
        Long orgId = resolveDefaultOrganisationId(saved.getId());
        Long centreId = resolveDefaultCentreId(saved.getId());
        return userMapper.toResponse(saved, orgId, centreId);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        User saved = userRepository.save(user);
        Long orgId = resolveDefaultOrganisationId(saved.getId());
        Long centreId = resolveDefaultCentreId(saved.getId());
        return userMapper.toResponse(saved, orgId, centreId);
    }

    private User find(Long id) {
        return userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String name : roleNames) {
            Role role = roleRepository.findByName(name)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", name));
            roles.add(role);
        }
        return roles;
    }

    private Long resolveDefaultOrganisationId(Long userId) {
        List<UserOrganisationMembership> memberships =
                organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(userId);
        return memberships.stream()
                .filter(UserOrganisationMembership::isDefaultMembership)
                .findFirst()
                .map(UserOrganisationMembership::getOrganisationId)
                .orElse(memberships.isEmpty() ? null : memberships.getFirst().getOrganisationId());
    }

    private Long resolveDefaultCentreId(Long userId) {
        List<UserCentreMembership> memberships =
                centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(userId);
        return memberships.stream()
                .filter(UserCentreMembership::isDefaultMembership)
                .findFirst()
                .map(UserCentreMembership::getCentreId)
                .orElse(memberships.isEmpty() ? null : memberships.getFirst().getCentreId());
    }
}
