package com.example.Car.Services.DTO.response;


import com.example.Car.Services.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String phone;
    private String email;
    private String fullName;
    private String role;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;



      public static UserResponse convert(User user){
        return  new UserResponse(

                user.getId(),
                user.getPhone(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()


        );

      }




}
