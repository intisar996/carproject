package com.example.Car.Services.DTO.response;

import lombok.Data;

import java.time.LocalDateTime;




@Data
public class RatingResponse {


    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
}
