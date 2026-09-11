package com.penguinpeak.childcare.common.time;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Application-wide UTC clock for machine/audit timestamps. */
@Configuration
public class DateTimeConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
