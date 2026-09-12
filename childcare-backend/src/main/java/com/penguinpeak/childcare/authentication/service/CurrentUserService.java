package com.penguinpeak.childcare.authentication.service;

import com.penguinpeak.childcare.authentication.entity.User;
import com.penguinpeak.childcare.authentication.repository.UserRepository;
import com.penguinpeak.childcare.common.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUser getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CurrentUser)) {
            throw new IllegalStateException("No authenticated user found");
        }
        return (CurrentUser) auth.getPrincipal();
    }

    public Long getCurrentUserId() {
        return getCurrentUser().userId();
    }

    public Long getCurrentOrganisationId() {
        return getCurrentUser().organisationId();
    }

    public Long getCurrentCentreId() {
        return getCurrentUser().centreId();
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        return userRepository.findByIdAndDeletedAtIsNull(getCurrentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
