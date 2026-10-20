
package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.enums.PhotoType;
import lombok.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerRepairPhotoResponse {

    private Long photoId;
    private Long requestId;
    private PhotoType photoType;
    private String imageUrl;
    private Instant capturedAt;

    public static OwnerRepairPhotoResponse convertTo(
            RepairPhoto photo) {

        if (photo == null) {
            return null;
        }

        Long requestId = photo.getServiceRequest().getRequestId();

        return OwnerRepairPhotoResponse.builder()
                .photoId(photo.getPhotoId())
                .requestId(requestId)
                .photoType(photo.getPhotoType())
                .imageUrl(
                        "/api/owner/requests/" + requestId
                                + "/photos/" + photo.getPhotoId()
                                + "/image"
                )
                .capturedAt(photo.getCapturedAt())
                .build();
    }

    public static List<OwnerRepairPhotoResponse> convertToList(
            List<RepairPhoto> photos) {

        if (photos == null || photos.isEmpty()) {
            return Collections.emptyList();
        }

        return photos.stream()
                .map(OwnerRepairPhotoResponse::convertTo)
                .collect(Collectors.toList());
    }
}
