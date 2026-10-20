package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.enums.PhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairPhotoResponse {

    private Long photoId;
    private Long requestId;
    private PhotoType photoType;
    private String imageUrl;
    private Instant capturedAt;

    public static RepairPhotoResponse convertToDTO(RepairPhoto entity) {

        Long requestId = entity.getServiceRequest().getRequestId();

        return RepairPhotoResponse.builder()
                .photoId(entity.getPhotoId())
                .requestId(requestId)
                .photoType(entity.getPhotoType())
                .imageUrl("/api/technician/requests/" + requestId + "/photos/" + entity.getPhotoId() + "/image")
                .capturedAt(entity.getCapturedAt())
                .build();
    }

    public static List<RepairPhotoResponse> convertToDTO(
            List<RepairPhoto> entities) {

        List<RepairPhotoResponse> responses = new ArrayList<>();

        for (RepairPhoto entity : entities) {
            responses.add(convertToDTO(entity));
        }

        return responses;
    }
}