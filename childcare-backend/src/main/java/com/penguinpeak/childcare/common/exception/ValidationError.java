package com.penguinpeak.childcare.common.exception;

/** A deterministic field-level validation error. */
public record ValidationError(String field, String message) {
}
