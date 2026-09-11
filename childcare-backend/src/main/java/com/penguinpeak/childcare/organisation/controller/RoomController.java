package com.penguinpeak.childcare.organisation.controller;

import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.organisation.dto.CreateRoomRequest;
import com.penguinpeak.childcare.organisation.dto.RoomResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateRoomRequest;
import com.penguinpeak.childcare.organisation.service.RoomService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController @Validated @RequiredArgsConstructor
public class RoomController {
    private final RoomService service;
    @PostMapping("/api/v1/centres/{centreId}/rooms") @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<RoomResponse> create(@PathVariable @Positive Long centreId, @Valid @RequestBody CreateRoomRequest request) { return ApiResponse.success(service.create(centreId, request)); }
    @GetMapping("/api/v1/centres/{centreId}/rooms")
    ApiPageResponse<RoomResponse> list(@PathVariable @Positive Long centreId, @PageableDefault(size = 20) Pageable pageable) { return ApiPageResponse.from(service.list(centreId, pageable)); }
    @GetMapping("/api/v1/rooms/{id}") ApiResponse<RoomResponse> get(@PathVariable @Positive Long id) { return ApiResponse.success(service.get(id)); }
    @PatchMapping("/api/v1/rooms/{id}") ApiResponse<RoomResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody UpdateRoomRequest request) { return ApiResponse.success(service.update(id, request)); }
}
