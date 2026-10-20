package com.example.Car.Services.Interface.Account;

import com.example.Car.Services.DTO.request.UserRequest;
import com.example.Car.Services.DTO.response.EmailValidationResponse;
import com.example.Car.Services.DTO.response.LoginResponse;
import com.example.Car.Services.DTO.response.MessageResponse;
import jakarta.validation.Valid;

public interface AuthServiceInterface {


    MessageResponse signup(@Valid UserRequest userRequest);


    LoginResponse login( String email, String password);

    EmailValidationResponse validateEmail(String email);

    MessageResponse verifyEmail(String token);

    MessageResponse resendVerification( String email);

    MessageResponse forgotPassword(String email);

    MessageResponse resetPassword(String token,  String newPassword);

    MessageResponse changePassword(String email, String currentPassword, String newPassword);

    LoginResponse currentUser(String email);

     MessageResponse technicianResetPassword(String rawToken, String newPassword);

    }
