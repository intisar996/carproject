package com.example.Car.Services.expection;

public class EmailSendingException extends RuntimeException {


    public EmailSendingException(String message) {
        super(message);
    }

    public EmailSendingException(String message, Throwable cause) {
        super(message,cause);
    }
}
