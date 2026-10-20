package com.example.Car.Services.expection;

public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
