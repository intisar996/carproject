package com.example.Car.Services.Controller.Admin;


import com.example.Car.Services.DTO.request.UserRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.Account.UserInterface;
import com.example.Car.Services.entities.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserInterface userService;

    @PostMapping
    public ResponseEntity<MessageResponse> createUser(@Valid @RequestBody UserRequest userRequest){
        return  ResponseEntity.ok(userService.createUser(userRequest));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>>  getAllUsers( ){
        return ResponseEntity.ok(userService.getAll());

    }




}
