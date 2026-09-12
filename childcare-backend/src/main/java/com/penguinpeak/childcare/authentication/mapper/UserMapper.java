package com.penguinpeak.childcare.authentication.mapper;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse; import com.penguinpeak.childcare.authentication.entity.User;
import java.util.Set; import org.springframework.stereotype.Component;
@Component public class UserMapper {
 public UserResponse toResponse(User u, Long organisationId, Long centreId) { Set<String> roles=u.getRoles().stream().map(r->r.getName()).collect(java.util.stream.Collectors.toUnmodifiableSet()); return new UserResponse(u.getId(),u.getEmail(),u.getFirstName(),u.getLastName(),u.getPhone(),u.getAvatarUrl(),u.isActive(),u.isEmailVerified(),roles,organisationId,centreId,u.getLastLoginAt(),u.getCreatedAt(),u.getUpdatedAt()); }
}
