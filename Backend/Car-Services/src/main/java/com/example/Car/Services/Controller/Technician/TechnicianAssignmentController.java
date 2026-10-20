package com.example.Car.Services.Controller.Technician;

import com.example.Car.Services.DTO.TechnicianAssignmentDTO;
import com.example.Car.Services.DTO.request.AssignTechnicianRequestDTO;
import com.example.Car.Services.DTO.request.UpdateAssignmentStatusRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.Technician.TechnicianAssignmentServiceInterface;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.AssignmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TechnicianAssignmentController {

    private final TechnicianAssignmentServiceInterface technicianAssignmentService;

    @PostMapping("/owner/assignments")
    @PreAuthorize("hasRole('GARAGE_OWNER')")
    public ResponseEntity<MessageResponse> assignTechnician(@AuthenticationPrincipal User currentUser, @RequestBody AssignTechnicianRequestDTO dto) {
        return ResponseEntity.ok(technicianAssignmentService.assignTechnician(dto,currentUser.getId()));
    }

    @PreAuthorize("hasRole('TECHNICIAN')")
    @PostMapping("/assignments/{assignmentId}/location")
    public ResponseEntity<MessageResponse> updateLocation(@PathVariable Long assignmentId, @RequestBody TechnicianAssignmentDTO dto, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(technicianAssignmentService.updateLocation(assignmentId, dto, currentUser.getId()));
    }


    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/assignments/{assignmentId}/status") public ResponseEntity<MessageResponse> updateStatus(@PathVariable Long assignmentId, @RequestParam AssignmentStatus status, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(technicianAssignmentService.updateStatus(assignmentId, status, currentUser.getId()));
    }



    @PreAuthorize("hasRole('TECHNICIAN')")
    @GetMapping("/technician/assignments")
    public ResponseEntity<?> getMyAssignments(@AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(technicianAssignmentService.getMyAssignments(currentUser.getId())
        );
    }


    @GetMapping("/owner/assignments")
    @PreAuthorize("hasRole('GARAGE_OWNER')")
    public ResponseEntity<?> getOwnerAssignments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(technicianAssignmentService.getOwnerAssignments(currentUser.getId())
        );
    }

}