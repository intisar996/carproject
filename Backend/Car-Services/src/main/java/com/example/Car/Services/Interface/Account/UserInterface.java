package com.example.Car.Services.Interface.Account;


import com.example.Car.Services.DTO.request.UserRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.entities.User;
import jakarta.validation.Valid;

import java.util.List;

public interface UserInterface {
    MessageResponse createUser(@Valid UserRequest userRequest);


    List<User> getAll();
}
