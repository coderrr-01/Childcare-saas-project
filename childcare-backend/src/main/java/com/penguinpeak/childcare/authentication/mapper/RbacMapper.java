package com.penguinpeak.childcare.authentication.mapper;
import com.penguinpeak.childcare.authentication.dto.response.*; import com.penguinpeak.childcare.authentication.entity.*; import org.springframework.stereotype.Component;
@Component public class RbacMapper {
 public RoleResponse role(Role r) { return new RoleResponse(r.getId(),r.getName(),r.getDescription(),r.getPermissions().stream().map(Permission::getCode).collect(java.util.stream.Collectors.toUnmodifiableSet())); }
 public PermissionResponse permission(Permission p) { return new PermissionResponse(p.getId(),p.getCode(),p.getResource(),p.getAction(),p.getDescription()); }
}
