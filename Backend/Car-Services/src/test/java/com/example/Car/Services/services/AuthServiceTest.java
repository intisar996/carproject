package com.example.Car.Services.services;

import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.Security.JwtUtil;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.Role;
import com.example.Car.Services.DTO.response.LoginResponse;
import com.example.Car.Services.service.Account.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

    @ExtendWith(MockitoExtension.class)
    class AuthServiceTest {

        @Mock
        private UserRepository userRepository;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private JwtUtil jwtUtil;

        @InjectMocks
        private AuthService authService;

        @Test
        void login_shouldReturnLoginResponse_whenCredentialsAreValid() {

            User user = new User();
            user.setEmail("test@gmail.com");
            user.setPassword("encodedPassword");
            user.setFullName("Test User");
            user.setRole(Role.GARAGE_OWNER);
            user.setActive(true);
            user.setEmailVerified(true);

            when(userRepository.findByEmail("test@gmail.com"))
                    .thenReturn(Optional.of(user));

            when(passwordEncoder.matches("123456", "encodedPassword"))
                    .thenReturn(true);

            when(jwtUtil.generateToken(12L, "test@gmail.com", "USER"))
                    .thenReturn("fake-jwt-token");

            LoginResponse response =
                    authService.login("test@gmail.com", "123456");

            assertNotNull(response);
            assertEquals("fake-jwt-token", response.getToken());
            assertEquals("test@gmail.com", response.getEmail());
            assertEquals("Test User", response.getFullName());
            assertEquals("USER", response.getRole());
        }
    }

