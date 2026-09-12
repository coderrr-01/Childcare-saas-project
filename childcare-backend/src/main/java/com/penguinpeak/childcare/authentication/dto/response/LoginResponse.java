package com.penguinpeak.childcare.authentication.dto.response;
public record LoginResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserResponse user) { }
