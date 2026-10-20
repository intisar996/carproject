package com.example.Car.Services.Controller.Account;


import com.example.Car.Services.Interface.Account.AuthServiceInterface;
import com.example.Car.Services.DTO.request.*;
import com.example.Car.Services.DTO.response.EmailValidationResponse;
import com.example.Car.Services.DTO.response.LoginResponse;
import com.example.Car.Services.DTO.response.MessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {


    private final AuthServiceInterface authService;

   @PostMapping("/signup")
    public ResponseEntity<MessageResponse>  signup(@Valid @RequestBody UserRequest userRequest){
       return ResponseEntity.ok(authService.signup(userRequest));
   }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> signIn(@Valid @RequestBody LoginRequest request){
       LoginResponse response = authService.login(request.getEmail(),request.getPassword());
       return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-email")
    public ResponseEntity<EmailValidationResponse> validateEmail(@RequestParam String email){
       return  ResponseEntity.ok(authService.validateEmail(email));
    }


    @GetMapping("/verify-email")
    public  ResponseEntity<MessageResponse>  verifyEmail(@RequestParam String token){
        return ResponseEntity.ok(authService.verifyEmail(token));
    }



    @PostMapping("resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody EmailRequest emailRequest){
         return ResponseEntity.ok(authService.resendVerification(emailRequest.getEmail()));
    }




    @PostMapping("/forget-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody EmailRequest emailRequest){
       return ResponseEntity.ok(authService.forgotPassword(emailRequest.getEmail()));
    }


    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest){

       return ResponseEntity.ok(authService.resetPassword(resetPasswordRequest.getToken(),resetPasswordRequest.getNewPassword()));
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest changePasswordRequest){

       String email = authentication.getName();
       return ResponseEntity.ok(authService.changePassword(
               email,changePasswordRequest.getCurrentPassword(),
               changePasswordRequest.getNewPassword()
       ));
    }

     @GetMapping("/current-user")
    public ResponseEntity<LoginResponse> currentUser(Authentication authentication){
       String email = authentication.getName();
       return ResponseEntity.ok(authService.currentUser(email));
     }


    @PostMapping("/set-password")
    public ResponseEntity<MessageResponse> setPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest){

        return ResponseEntity.ok(authService.technicianResetPassword(resetPasswordRequest.getToken(),resetPasswordRequest.getNewPassword()));
    }

















}
