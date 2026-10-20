package com.example.Car.Services.Controller.Technician;

import com.example.Car.Services.DTO.response.CustomerTrackingResponse;
import com.example.Car.Services.service.Technician.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/{trackingToken}")
    public ResponseEntity<CustomerTrackingResponse> getTracking(@PathVariable String trackingToken) {
        return ResponseEntity.ok(trackingService.getTracking(trackingToken));
    }
}