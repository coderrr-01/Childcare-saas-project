package com.penguinpeak.childcare.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Transport metadata that applies to every successful API response. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiMeta(String requestId, PaginationMeta pagination) {

    public static ApiMeta request(String requestId) {
        return new ApiMeta(requestId, null);
    }

    public ApiMeta withPagination(PaginationMeta pagination) {
        return new ApiMeta(requestId, pagination);
    }
}
