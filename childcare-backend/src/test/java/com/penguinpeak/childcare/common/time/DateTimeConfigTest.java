package com.penguinpeak.childcare.common.time;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DateTimeConfigTest {
    @Test
    void providesUtcClock() {
        assertThat(new DateTimeConfig().clock().getZone().getId()).isEqualTo("Z");
    }
}
