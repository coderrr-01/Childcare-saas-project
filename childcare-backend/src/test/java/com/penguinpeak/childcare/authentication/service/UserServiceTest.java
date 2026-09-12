package com.penguinpeak.childcare.authentication.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

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
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private UserOrganisationMembershipRepository organisationMembershipRepository;
    @Mock private UserCentreMembershipRepository centreMembershipRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserService userService;

    private User user;
    private Role educatorRole;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setPasswordHash("$2a$10$hashedpassword");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActive(true);

        educatorRole = new Role();
        educatorRole.setId(1L);
        educatorRole.setName("EDUCATOR");
    }

    @Test
    void getReturnsUser() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(user, null, null)).thenReturn(buildResponse());

        UserResponse response = userService.get(1L);

        assertThat(response.id()).isEqualTo(1L);
    }

    @Test
    void getThrowsForMissingUser() {
        when(userRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.get(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createSuccess() {
        CreateUserRequest request = new CreateUserRequest(
                "new@test.com", "password123456789", "John", "Doe", "1234567890",
                1L, 2L, Set.of("EDUCATOR"));

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123456789")).thenReturn("$2a$10$encoded");
        when(roleRepository.findByName("EDUCATOR")).thenReturn(Optional.of(educatorRole));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(userMapper.toResponse(any(), any(), any())).thenReturn(buildResponse());

        UserResponse response = userService.create(request);

        assertThat(response).isNotNull();
    }

    @Test
    void createThrowsOnDuplicateEmail() {
        CreateUserRequest request = new CreateUserRequest(
                "existing@test.com", "password123456789", "John", "Doe", null,
                null, null, Set.of("EDUCATOR"));

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void updateSuccess() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), any(), any())).thenReturn(buildResponse());

        UpdateUserRequest request = new UpdateUserRequest("Jane", "Doe", null, null);
        UserResponse response = userService.update(1L, request);

        assertThat(response).isNotNull();
    }

    @Test
    void updateStatusSuccess() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), any(), any())).thenReturn(buildResponse());

        UpdateUserStatusRequest request = new UpdateUserStatusRequest(false);
        UserResponse response = userService.updateStatus(1L, request);

        assertThat(response).isNotNull();
    }

    @Test
    void listReturnsPage() {
        Page<User> page = new PageImpl<>(List.of(user));
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), any(), any())).thenReturn(buildResponse());

        Page<UserResponse> result = userService.list(Pageable.unpaged());

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void updateProfileSuccess() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(centreMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), any(), any())).thenReturn(buildResponse());

        UpdateProfileRequest request = new UpdateProfileRequest("Jane", "Smith", "0400000000", null);
        UserResponse response = userService.updateProfile(1L, request);

        assertThat(response).isNotNull();
    }

    @Test
    void updateProfileFailsForMissingUser() {
        when(userRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(99L, new UpdateProfileRequest("A", "B", null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private UserResponse buildResponse() {
        return new UserResponse(1L, "user@test.com", "Test", "User", null, null,
                true, false, Set.of("EDUCATOR"), null, null, null, null, null);
    }
}
