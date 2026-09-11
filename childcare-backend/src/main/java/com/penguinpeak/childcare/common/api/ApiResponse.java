package com.penguinpeak.childcare.common.api;

import com.penguinpeak.childcare.common.web.RequestIdFilter;

/** Stable envelope for all successful, non-paginated API responses. */
public record ApiResponse<T>(T data, ApiMeta meta) {

    public static <T> ApiResponse<T> success(T data) {
        return success(data, ApiMeta.request(RequestIdFilter.currentRequestId()));
    }

    public static <T> ApiResponse<T> success(T data, ApiMeta meta) {
        return new ApiResponse<>(data, meta);
    }
}
