package com.example.Car.Services.service.Account;

import com.example.Car.Services.Interface.Account.AuthServiceInterface;
import com.example.Car.Services.DTO.request.UserRequest;
import com.example.Car.Services.DTO.response.EmailValidationResponse;
import com.example.Car.Services.DTO.response.LoginResponse;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Security.SecureToken;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.RequestStatus;
import com.example.Car.Services.enums.Role;
import com.example.Car.Services.expection.*;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.Security.JwtUtil;
import com.example.Car.Services.Utils.ServiceUtils;
import com.example.Car.Services.service.common.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements AuthServiceInterface {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final ServiceUtils serviceUtils;


    @Transactional
    @Override
    public MessageResponse signup(UserRequest userRequest) {

        log.info("Login Start");
        if(userRepository.existsByEmail(userRequest.getEmail())) {
             throw new ConflictException("Email already exists");
        }

        if(userRepository.existsByPhone(userRequest.getPhone())){
            throw  new ConflictException("Phone already exists");
        }

        User user = new User();
        user.setPhone(userRequest.getPhone());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(Role.GARAGE_OWNER);
        user.setActive(true);
        user.setEmailVerified(false);
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(Instant.now().plusSeconds(86400));
        userRepository.save(user);



        emailService.sendVerificationEmail(userRequest.getEmail(),verificationToken);
        return new MessageResponse("Registration successful! Please check your email to verify your account.");
    }


    @Transactional
    @Override
    public LoginResponse login(String email, String password) {

        log.info("Start login for email: {}", email);
       User user = userRepository
               .findByEmail(email.trim())
               .filter(u -> passwordEncoder.matches(password,u.getPassword()))
               .orElseThrow(() ->  {
                   log.warn("Login failed: Invalid  Email");
                  return new BadRequestException("Invalid Email or password");
               });

        if(!user.getActive()){
            log.warn("Login blocked : Account is deactivated for email {}",email);
            throw new AccessDeniedException("Your Account has been deactivate please contact support for assistance");
        }
        if(!user.isEmailVerified()){
            log.warn("Login blocked: Email not verified for email: {}", email);
            throw new BadRequestException("Please verify your email adderss before loggin in. Check your inbox for the verification link");
        }
        final String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());        log.info("Login successful for email: {} with Role: {}", user.getEmail(), user.getRole().name());
        return new LoginResponse(user.getEmail(),user.getFullName(),user.getRole().name(),token);
    }






    @Transactional
    @Override
    public EmailValidationResponse validateEmail(String email) {
        Boolean exists = userRepository.existsByEmail(email);
        return  new EmailValidationResponse(exists, !exists);
    }

    @Override
    public MessageResponse verifyEmail(String token) {
        User user =
                userRepository.findByVerificationToken(token)
                        .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));


        if(user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(Instant.now())){
            throw new BadRequestException("Verification link expired,Please request new one");
        }


        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        return new MessageResponse("Email verified successfully, you can login now");
    }

    @Override
    public MessageResponse resendVerification(String email) {


        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setVerificationTokenExpiry(Instant.now().plusSeconds(84600));
            userRepository.save(user);
            emailService.sendVerificationEmail(email, verificationToken);
        }
            return new MessageResponse("Verification email resent sucessfully Please check your inbox ");

    }

    @Override
    public MessageResponse forgotPassword(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            SecureToken token = SecureToken.generate();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(Instant.now().plusSeconds(3600));
            userRepository.save(user);
            emailService.sendPasswordRestEmail(email, resetToken);
        });
            return new MessageResponse("If an account exists with this email, " +
                    "you will receive a password reset email.");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(String token, String newPassword) {

          User user = userRepository.findByPasswordResetToken(token)
                  .orElseThrow(() -> new BadCredentialsException("Invalid or expired token"));

         if(user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(Instant.now())){
             throw new BadCredentialsException("Reset token has expired");
         }
         user.setPassword(passwordEncoder.encode(newPassword));
         user.setPasswordResetToken(null);
         user.setPasswordResetTokenExpiry(null);
         user.setActive(true);
        return new MessageResponse("Password reset successfully. You can now login with your password ");
    }



    @Override
    public MessageResponse changePassword(String email, String currentPassword, String newPassword) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){
            throw  new BadRequestException("Current password is incorrect");
        }

         user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return new MessageResponse("Password change successfully");


    }

    @Override
    public LoginResponse currentUser(String email) {
        User user = serviceUtils.getUserByEmailOrThrow(email);
        return new LoginResponse(
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                null
        );
    }



    @Override
    @Transactional
    public MessageResponse technicianResetPassword(String token, String newPassword) {

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired token"));

        if(user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(Instant.now())){
            throw new BadCredentialsException("Reset token has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setActive(true);
        user.setEmailVerified(true);
        return new MessageResponse("Password reset successfully. You can now login with your password ");
    }



}
