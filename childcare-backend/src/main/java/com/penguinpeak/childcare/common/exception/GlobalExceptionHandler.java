package com.penguinpeak.childcare.common.exception;

import com.penguinpeak.childcare.common.constants.HttpConstants;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.Comparator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

/** Produces the sole RFC 9457 error contract for MVC endpoints. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, ApiErrorCode.RESOURCE_NOT_FOUND, "Resource not found",
                "The requested resource was not found.", request, null);
    }

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ProblemDetail> handleBusiness(BusinessException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, ApiErrorCode.BUSINESS_ERROR, "Business rule violation",
                "The request cannot be processed in its current state.", request, null);
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ProblemDetail> handleConflict(ConflictException exception, HttpServletRequest request) {
        return problem(HttpStatus.CONFLICT, ApiErrorCode.CONFLICT, "Resource conflict",
                "The requested operation conflicts with the current resource state.", request, null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<ProblemDetail> handleUnauthorized(UnauthorizedException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED, "Unauthorized",
                "Authentication is required or invalid.", request, null);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException exception,
                                                              HttpServletRequest request) {
        List<ValidationError> errors = exception.getConstraintViolations().stream()
                .map(violation -> new ValidationError(lastPathSegment(violation.getPropertyPath().toString()),
                        violation.getMessage()))
                .sorted(Comparator.comparing(ValidationError::field).thenComparing(ValidationError::message))
                .toList();
        return validationProblem(request, errors);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ProblemDetail> handleResponseStatus(ResponseStatusException exception, HttpServletRequest request) {
        if (exception.getStatusCode().value() == HttpStatus.FORBIDDEN.value()) {
            return problem(HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN, "Forbidden",
                    "You do not have permission to access this resource.", request, null);
        }
        return problem(HttpStatus.BAD_REQUEST, ApiErrorCode.BAD_REQUEST, "Bad request",
                "The request could not be processed.", request, null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> handleUnexpected(Exception exception, HttpServletRequest request) {
        LOGGER.error("Unhandled request failure; requestId={}", RequestIdFilter.currentRequestId(), exception);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal server error",
                "An unexpected error occurred.", request, null);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
                                                                    HttpHeaders headers,
                                                                    HttpStatusCode status,
                                                                    WebRequest request) {
        List<ValidationError> errors = exception.getBindingResult().getFieldErrors().stream()
                .map(this::toValidationError)
                .sorted(Comparator.comparing(ValidationError::field).thenComparing(ValidationError::message))
                .toList();
        return asObject(validationProblem(servletRequest(request), errors));
    }

    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(HandlerMethodValidationException exception,
                                                                              HttpHeaders headers,
                                                                              HttpStatusCode status,
                                                                              WebRequest request) {
        List<ValidationError> errors = exception.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream()
                        .map(error -> new ValidationError(result.getMethodParameter().getParameterName(),
                                error.getDefaultMessage())))
                .sorted(Comparator.comparing(ValidationError::field).thenComparing(ValidationError::message))
                .toList();
        return asObject(validationProblem(servletRequest(request), errors));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException exception,
                                                                    HttpHeaders headers,
                                                                    HttpStatusCode status,
                                                                    WebRequest request) {
        return asObject(problem(HttpStatus.BAD_REQUEST, ApiErrorCode.BAD_REQUEST, "Malformed request",
                "The request body could not be read.", servletRequest(request), null));
    }

    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException exception,
                                                                           HttpHeaders headers,
                                                                           HttpStatusCode status,
                                                                           WebRequest request) {
        return asObject(problem(HttpStatus.METHOD_NOT_ALLOWED, ApiErrorCode.METHOD_NOT_ALLOWED, "Method not allowed",
                "The HTTP method is not supported for this resource.", servletRequest(request), null));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception,
                                                                       HttpHeaders headers,
                                                                       HttpStatusCode status,
                                                                       WebRequest request) {
        return asObject(problem(HttpStatus.UNSUPPORTED_MEDIA_TYPE, ApiErrorCode.MEDIA_TYPE_NOT_SUPPORTED,
                "Unsupported media type", "The request content type is not supported.", servletRequest(request), null));
    }

    @Override
    protected ResponseEntity<Object> handleNoResourceFoundException(NoResourceFoundException exception,
                                                                     HttpHeaders headers,
                                                                     HttpStatusCode status,
                                                                     WebRequest request) {
        return asObject(problem(HttpStatus.NOT_FOUND, ApiErrorCode.RESOURCE_NOT_FOUND, "Resource not found",
                "The requested resource was not found.", servletRequest(request), null));
    }

    private ResponseEntity<ProblemDetail> validationProblem(HttpServletRequest request, List<ValidationError> errors) {
        return problem(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, "Validation failed",
                "One or more fields are invalid.", request, errors);
    }

    private ResponseEntity<ProblemDetail> problem(HttpStatus status, ApiErrorCode code, String title, String detail,
                                                  HttpServletRequest request, List<ValidationError> errors) {
        ProblemDetail body = ProblemDetail.forStatusAndDetail(status, detail);
        body.setType(URI.create(HttpConstants.PROBLEM_BASE_URI + code.name().toLowerCase().replace('_', '-')));
        body.setTitle(title);
        body.setInstance(URI.create(request.getRequestURI()));
        body.setProperty("code", code.name());
        body.setProperty("requestId", RequestIdFilter.currentRequestId());
        if (errors != null && !errors.isEmpty()) {
            body.setProperty("errors", errors);
        }
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    private ValidationError toValidationError(FieldError error) {
        return new ValidationError(error.getField(), error.getDefaultMessage());
    }

    private String lastPathSegment(String propertyPath) {
        int separator = propertyPath.lastIndexOf('.');
        return separator < 0 ? propertyPath : propertyPath.substring(separator + 1);
    }

    private HttpServletRequest servletRequest(WebRequest request) {
        return (HttpServletRequest) request.resolveReference(WebRequest.REFERENCE_REQUEST);
    }

    private ResponseEntity<Object> asObject(ResponseEntity<ProblemDetail> response) {
        return new ResponseEntity<>(response.getBody(), response.getHeaders(), response.getStatusCode());
    }
}
