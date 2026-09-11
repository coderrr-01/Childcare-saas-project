package com.penguinpeak.childcare.config;

import org.springframework.context.annotation.Configuration;

/**
 * Deliberately small: Spring Boot's configured JSON mapper already serializes Java Time values as ISO-8601.
 * Keep any future cross-cutting mapper customizations here rather than in controllers.
 */
@Configuration
public class JacksonConfig {
}
