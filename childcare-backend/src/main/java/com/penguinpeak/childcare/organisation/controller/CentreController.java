package com.penguinpeak.childcare.organisation.controller;

import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.organisation.dto.CentreResponse;
import com.penguinpeak.childcare.organisation.dto.CreateCentreRequest;
import com.penguinpeak.childcare.organisation.dto.UpdateCentreRequest;
import com.penguinpeak.childcare.organisation.service.CentreService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController @Validated @RequiredArgsConstructor
public class CentreController {
    private final CentreService service;
    @PostMapping("/api/v1/organisations/{organisationId}/centres") @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<CentreResponse> create(@PathVariable @Positive Long organisationId, @Valid @RequestBody CreateCentreRequest request) { return ApiResponse.success(service.create(organisationId, request)); }
    @GetMapping("/api/v1/organisations/{organisationId}/centres")
    ApiPageResponse<CentreResponse> list(@PathVariable @Positive Long organisationId, @PageableDefault(size = 20) Pageable pageable) { return ApiPageResponse.from(service.list(organisationId, pageable)); }
    @GetMapping("/api/v1/centres/{id}") ApiResponse<CentreResponse> get(@PathVariable @Positive Long id) { return ApiResponse.success(service.get(id)); }
    @PatchMapping("/api/v1/centres/{id}") ApiResponse<CentreResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody UpdateCentreRequest request) { return ApiResponse.success(service.update(id, request)); }
}
