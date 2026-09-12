package com.penguinpeak.childcare.authentication.controller;

import com.penguinpeak.childcare.authentication.dto.response.PermissionResponse;
import com.penguinpeak.childcare.authentication.mapper.RbacMapper;
import com.penguinpeak.childcare.authentication.repository.PermissionRepository;
import com.penguinpeak.childcare.common.api.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/permissions")
public class PermissionController {

    private final PermissionRepository permissionRepository;
    private final RbacMapper rbacMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('permissions:read')")
    public ApiResponse<List<PermissionResponse>> list() {
        return ApiResponse.success(permissionRepository.findAllByOrderByCodeAsc().stream()
                .map(rbacMapper::permission)
                .toList());
    }
}
