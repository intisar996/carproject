package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.DTO.request.GarageServiceOptionRequestDTO;
import com.example.Car.Services.DTO.response.GarageServiceOptionResponseDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.GarageOwner.GarageServiceOptionServiceInterface;
import com.example.Car.Services.entities.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/garages")
@PreAuthorize("hasRole('GARAGE_OWNER')")
@RequiredArgsConstructor
public class GarageServiceOptionController {

    private final GarageServiceOptionServiceInterface garageServiceOptionService;


    // =========================
    // ADD SERVICE OPTION
    // =========================

    @PostMapping("/{garageId}/service-options")
    public ResponseEntity<MessageResponse> addServiceOption(
            @PathVariable Long garageId,
            @Valid @RequestBody GarageServiceOptionRequestDTO request,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(
                garageServiceOptionService.addServiceOption(
                        garageId,
                        currentUser.getId(),
                        request
                )
        );
    }


    // =========================
    // GET ALL SERVICE OPTIONS
    // =========================

    @GetMapping("/{garageId}/service-options")
    public ResponseEntity<List<GarageServiceOptionResponseDTO>>
    getGarageServiceOptions(
            @PathVariable Long garageId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(
                garageServiceOptionService.getGarageServiceOptions(
                        garageId,
                        currentUser.getId()
                )
        );
    }


    // =========================
    // UPDATE SERVICE OPTION
    // =========================

    @PutMapping("/{garageId}/service-options/{garageOptionId}")
    public ResponseEntity<MessageResponse> updateServiceOption(
            @PathVariable Long garageId,
            @PathVariable Long garageOptionId,
            @Valid @RequestBody GarageServiceOptionRequestDTO request,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(
                garageServiceOptionService.updateServiceOption(
                        garageId,
                        garageOptionId,
                        currentUser.getId(),
                        request
                )
        );
    }
}