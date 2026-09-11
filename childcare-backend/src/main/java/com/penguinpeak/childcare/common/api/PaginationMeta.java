package com.penguinpeak.childcare.common.api;

import org.springframework.data.domain.Page;

/** Zero-based pagination information returned with collection responses. */
public record PaginationMeta(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious) {

    public static PaginationMeta from(Page<?> page) {
        return new PaginationMeta(
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(),
                page.hasNext(), page.hasPrevious());
    }
}
