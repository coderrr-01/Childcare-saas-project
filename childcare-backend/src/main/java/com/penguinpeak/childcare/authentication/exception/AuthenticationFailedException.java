package com.penguinpeak.childcare.authentication.exception;
public class AuthenticationFailedException extends RuntimeException { public AuthenticationFailedException() { super("Invalid email or password."); } }
