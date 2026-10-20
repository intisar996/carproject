package com.example.Car.Services.service.Account;

import com.example.Car.Services.DTO.request.UserRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.Account.UserInterface;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.Utils.ServiceUtils;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.Role;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.expection.ConflictException;
import com.example.Car.Services.expection.EmailAlreadyExistsException;
import com.example.Car.Services.service.common.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;


@Service
public class UserService implements UserInterface {



    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ServiceUtils serviceUtils;
    @Autowired
    private EmailService emailService;

    @Override
    public MessageResponse createUser(UserRequest userRequest) {

        if(userRepository.findByEmail(userRequest.getEmail()).isPresent())
        {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        if(userRepository.findByPhone(userRequest.getPhone()).isPresent()){
            throw new ConflictException("Email already exists");
        }

        
        validateRole(userRequest.getRole());
        
         User user = new User();
         user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setFullName(userRequest.getFullName());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        userRequest.setRole("ADMIN");
        user.setActive(true);
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(Instant.now().plusSeconds(86400));
        userRepository.save(user);
        emailService.sendVerificationEmail(userRequest.getEmail(),verificationToken);


        return new MessageResponse("User created successfully");
    }

    @Override
    public List<User> getAll() {
        return userRepository.getAllUser();
    }


    private void validateRole(String role) {
        if(Arrays.stream(Role.values()).noneMatch(r -> r.name().equalsIgnoreCase(role))){
            throw new BadRequestException("Invalid role: " + role);
        }
    }
}
