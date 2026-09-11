package com.penguinpeak.childcare.common.api;

import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.util.List;
import org.springframework.data.domain.Page;

/** Stable envelope for paginated collection API responses. */
public record ApiPageResponse<T>(List<T> data, ApiMeta meta) {

    public static <T> ApiPageResponse<T> from(Page<T> page) {
        return new ApiPageResponse<>(page.getContent(), ApiMeta.request(RequestIdFilter.currentRequestId())
                .withPagination(PaginationMeta.from(page)));
    }

    public static <T> ApiPageResponse<T> of(List<T> data, PaginationMeta pagination, String requestId) {
        return new ApiPageResponse<>(List.copyOf(data), ApiMeta.request(requestId).withPagination(pagination));
    }
}
