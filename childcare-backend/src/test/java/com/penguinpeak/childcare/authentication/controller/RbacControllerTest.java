package com.penguinpeak.childcare.authentication.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.dto.response.PermissionResponse;
import com.penguinpeak.childcare.authentication.dto.response.RoleResponse;
import com.penguinpeak.childcare.authentication.entity.Permission;
import com.penguinpeak.childcare.authentication.entity.Role;
import com.penguinpeak.childcare.authentication.mapper.RbacMapper;
import com.penguinpeak.childcare.authentication.repository.PermissionRepository;
import com.penguinpeak.childcare.authentication.repository.RoleRepository;
import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = {RoleController.class, PermissionController.class})
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class RbacControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private RoleRepository roleRepository;
    @MockitoBean private PermissionRepository permissionRepository;
    @MockitoBean private RbacMapper rbacMapper;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(authorities = "roles:read")
    void listRolesReturnsRoles() throws Exception {
        Role role = new Role();
        role.setId(1L);
        role.setName("EDUCATOR");
        role.setDescription("Educator role");
        role.setPermissions(Set.of());

        when(roleRepository.findAllByOrderByNameAsc()).thenReturn(List.of(role));
        when(rbacMapper.role(role)).thenReturn(
                new RoleResponse(1L, "EDUCATOR", "Educator role", Set.of()));

        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("EDUCATOR"));
    }

    @Test
    @WithMockUser(authorities = "permissions:read")
    void listPermissionsReturnsPermissions() throws Exception {
        Permission perm = new Permission();
        perm.setId(1L);
        perm.setCode("users:read");
        perm.setResource("users");
        perm.setAction("read");
        perm.setDescription("Read users");

        when(permissionRepository.findAllByOrderByCodeAsc()).thenReturn(List.of(perm));
        when(rbacMapper.permission(perm)).thenReturn(
                new PermissionResponse(1L, "users:read", "users", "read", "Read users"));

        mockMvc.perform(get("/api/v1/permissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].code").value("users:read"));
    }
}
