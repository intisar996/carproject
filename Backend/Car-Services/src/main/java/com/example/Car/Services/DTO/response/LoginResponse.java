package com.example.Car.Services.DTO.response;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {


    private String email;
    private String fullName;
    private String role;
    private String token;

}
