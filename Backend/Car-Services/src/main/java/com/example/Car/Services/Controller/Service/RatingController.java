
package com.example.Car.Services.Controller.Service;

import com.example.Car.Services.DTO.request.CreateRatingRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.RatingResponse;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.service.Service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping("/{trackingToken}")
    public ResponseEntity<MessageResponse> createRating(
            @PathVariable String trackingToken,
            @Valid @RequestBody CreateRatingRequest dto) {

        ratingService.createRating(trackingToken, dto);

        return ResponseEntity.ok(new MessageResponse("Thank you! Your rating was submitted successfully")
        );
    }


    @GetMapping("/owner/request/{requestId}")
    @PreAuthorize("hasRole('GARAGE_OWNER')")
    public ResponseEntity<RatingResponse> getRatingForOwner(
            @PathVariable Long requestId,
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        RatingResponse response = ratingService.getRatingForOwner(
                requestId,
                currentUser.getId()
        );

        return ResponseEntity.ok(response);
    }
}
