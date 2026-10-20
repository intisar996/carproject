package com.example.Car.Services.DTO.request;


import lombok.Data;

@Data
public class UserRequest {

    private String phone;
    private String email;
    private String password;
    private String fullName;
    private String role;
    private Boolean active ;


}
