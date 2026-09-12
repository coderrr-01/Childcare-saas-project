package com.penguinpeak.childcare.authentication.controller;

import com.penguinpeak.childcare.authentication.dto.response.RoleResponse;
import com.penguinpeak.childcare.authentication.mapper.RbacMapper;
import com.penguinpeak.childcare.authentication.repository.RoleRepository;
import com.penguinpeak.childcare.common.api.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleRepository roleRepository;
    private final RbacMapper rbacMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('roles:read')")
    public ApiResponse<List<RoleResponse>> list() {
        return ApiResponse.success(roleRepository.findAllByOrderByNameAsc().stream()
                .map(rbacMapper::role)
                .toList());
    }
}
