package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.DTO.request.NewGarageRequestDTO;
import com.example.Car.Services.DTO.response.GarageResponseDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.PageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;
import com.example.Car.Services.Interface.GarageOwner.GarageServiceInterface;
import com.example.Car.Services.entities.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/garages")
@PreAuthorize("hasRole('GARAGE_OWNER')")
@RequiredArgsConstructor
public class GarageOwnerController {

    private final GarageServiceInterface garageService;


    @GetMapping("owner/{ownerId}")
    public ResponseEntity<List<GarageResponseDTO>> getOwnerGarages(@PathVariable Long ownerId) {
        List<GarageResponseDTO> garages = garageService.getOwnerGarages(ownerId);
        return ResponseEntity.ok(garages);
    }

    @PatchMapping("/{garageId}/deactivate")
    public ResponseEntity<MessageResponse> deactivateGarage(
            @PathVariable Long garageId,
            Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long ownerId = currentUser.getId();
        MessageResponse response = garageService.deactivateGarage(garageId, ownerId);
        return ResponseEntity.ok(response);
    }


    @PostMapping(value = "/owner/request-garage",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> requestNewGarage(
            Authentication authentication,
            @Valid @ModelAttribute NewGarageRequestDTO request) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long ownerId = currentUser.getId();

        MessageResponse response =
                garageService.requestNewGarage(ownerId, request);

        return ResponseEntity.ok(response);
    }



    @GetMapping("register-document/{ownerId}")
    public ResponseEntity<PageResponse<RegistrationDocumentResponse>> getOwnerGarages(
            @PathVariable Long ownerId,
            @RequestParam int page,
            @RequestParam int size) {
        PageResponse<RegistrationDocumentResponse> garages = garageService.getOwnerGaragesReqisterDocumention(ownerId, page, size);
        return ResponseEntity.ok(garages);
    }


    @GetMapping("/owner/{ownerId}/active")
    public ResponseEntity<List<GarageResponseDTO>> getOwnerActiveGarages(
            @PathVariable Long ownerId) {

        return ResponseEntity.ok(
                garageService.getOwnerActiveGarages(ownerId)
        );
    }



}