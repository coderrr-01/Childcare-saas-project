package com.penguinpeak.childcare.organisation.controller;

import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.organisation.dto.CreateOrganisationRequest;
import com.penguinpeak.childcare.organisation.dto.OrganisationResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateOrganisationRequest;
import com.penguinpeak.childcare.organisation.service.OrganisationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController @Validated @RequiredArgsConstructor @RequestMapping("/api/v1/organisations")
public class OrganisationController {
    private final OrganisationService service;
    @PostMapping @ResponseStatus(HttpStatus.CREATED) ApiResponse<OrganisationResponse> create(@Valid @RequestBody CreateOrganisationRequest request) { return ApiResponse.success(service.create(request)); }
    @GetMapping("/{id}") ApiResponse<OrganisationResponse> get(@PathVariable @Positive Long id) { return ApiResponse.success(service.get(id)); }
    @GetMapping ApiPageResponse<OrganisationResponse> list(@PageableDefault(size = 20) Pageable pageable) { return ApiPageResponse.from(service.list(pageable)); }
    @PatchMapping("/{id}") ApiResponse<OrganisationResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody UpdateOrganisationRequest request) { return ApiResponse.success(service.update(id, request)); }
}
