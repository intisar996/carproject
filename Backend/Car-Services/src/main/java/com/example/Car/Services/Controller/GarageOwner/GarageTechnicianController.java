        package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.DTO.request.TechnicianRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.TechnicianResponseDTO;
import com.example.Car.Services.Interface.GarageOwner.GarageTechnicianServiceInterface;
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
public class GarageTechnicianController {

    private final GarageTechnicianServiceInterface garageTechnicianService;

    @PostMapping("/{garageId}/technicians")
    public ResponseEntity<MessageResponse> createTechnician(
            @Valid @RequestBody TechnicianRequestDTO request,
            @PathVariable Long garageId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        MessageResponse response =
                garageTechnicianService.addTechnician(
                        request,
                        garageId,
                        currentUser.getId()
                );

        return ResponseEntity.ok(response);
    }



    @GetMapping("{garageId}/technicians")
    public ResponseEntity<List<TechnicianResponseDTO>> getTechniciansByGarage(
            @PathVariable Long garageId
    ) {

        List<TechnicianResponseDTO> technicians =
                garageTechnicianService.getTechniciansByGarage(garageId);

        return ResponseEntity.ok(technicians);
    }

    @GetMapping("/{garageId}/technicians/{technicianId}")
    public ResponseEntity<TechnicianResponseDTO> findTechnician(
            @PathVariable Long garageId,
            @PathVariable Long technicianId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        TechnicianResponseDTO technician =
                garageTechnicianService.findTechnician(
                        technicianId,
                        garageId,
                        currentUser.getId()
                );

        return ResponseEntity.ok(technician);
    }

    @PutMapping("/{garageId}/technicians/{technicianId}/deactivate")
    public ResponseEntity<MessageResponse> deactivateTechnician(
            @PathVariable Long garageId,
            @PathVariable Long technicianId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        MessageResponse response =
                garageTechnicianService.deactivateTechnician(
                        technicianId,
                        garageId,
                        currentUser.getId()
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{garageId}/technicians/{technicianId}/activate")
    public ResponseEntity<MessageResponse> activateTechnician(
            @PathVariable Long garageId,
            @PathVariable Long technicianId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        MessageResponse response =
                garageTechnicianService.activateTechnician(
                        technicianId,
                        garageId,
                        currentUser.getId()
                );

        return ResponseEntity.ok(response);
    }
}

