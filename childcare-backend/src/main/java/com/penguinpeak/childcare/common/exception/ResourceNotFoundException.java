package com.penguinpeak.childcare.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Object resourceId) {
        super(resourceName + " with id '" + resourceId + "' was not found.");
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
