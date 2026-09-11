package com.penguinpeak.childcare.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PaginationMetaTest {
    @Test
    void mapsFirstMiddleLastAndEmptyPages() {
        assertPage(new PageImpl<>(List.of("a", "b"), PageRequest.of(0, 2), 5), 0, true, false);
        assertPage(new PageImpl<>(List.of("c", "d"), PageRequest.of(1, 2), 5), 1, true, true);
        assertPage(new PageImpl<>(List.of("e"), PageRequest.of(2, 2), 5), 2, false, true);
        PaginationMeta empty = PaginationMeta.from(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        assertThat(empty.totalPages()).isZero();
        assertThat(empty.hasNext()).isFalse();
        assertThat(empty.hasPrevious()).isFalse();
    }

    private void assertPage(PageImpl<String> page, int number, boolean next, boolean previous) {
        PaginationMeta meta = PaginationMeta.from(page);
        assertThat(meta.page()).isEqualTo(number);
        assertThat(meta.hasNext()).isEqualTo(next);
        assertThat(meta.hasPrevious()).isEqualTo(previous);
    }
}
