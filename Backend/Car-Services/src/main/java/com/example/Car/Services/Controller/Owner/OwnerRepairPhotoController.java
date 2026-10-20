package com.example.Car.Services.Controller.Owner;

import com.example.Car.Services.DTO.response.OwnerRepairPhotoResponse;
import com.example.Car.Services.Interface.Technician.RepairPhotoServiceInterface;
import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/owner/requests")
@PreAuthorize("hasRole('GARAGE_OWNER')")
@RequiredArgsConstructor
public class OwnerRepairPhotoController {

    private final RepairPhotoServiceInterface repairPhotoService;

    @Value("${file.repair-photo-dir}")
    private String repairPhotoDir;

    @GetMapping("/{requestId}/photos")
    public ResponseEntity<List<OwnerRepairPhotoResponse>> getOwnerPhotos(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User currentUser) {

        List<RepairPhoto> photos = repairPhotoService.getOwnerPhotos(
                requestId,
                currentUser.getId()
        );

        return ResponseEntity.ok(
                OwnerRepairPhotoResponse.convertToList(photos)
        );
    }

    @GetMapping("/{requestId}/photos/{photoId}/image")
    public ResponseEntity<Resource> getOwnerPhotoImage(
            @PathVariable Long requestId,
            @PathVariable Long photoId,
            @AuthenticationPrincipal User currentUser) throws IOException {

        // يتحقق أن الطلب تابع لكراج صاحب الحساب
        List<RepairPhoto> photos = repairPhotoService.getOwnerPhotos(
                requestId,
                currentUser.getId()
        );

        RepairPhoto photo = photos.stream()
                .filter(item -> item.getPhotoId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Photo not found"
                ));

        Path uploadPath = Paths.get(repairPhotoDir)
                .toAbsolutePath()
                .normalize();

        Path imagePath = uploadPath.resolve(photo.getImageUrl())
                .normalize();

        if (!imagePath.startsWith(uploadPath)
                || !Files.isRegularFile(imagePath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Image file not found"
            );
        }

        String contentType = Files.probeContentType(imagePath);

        if (contentType == null) {
            String fileName = imagePath.getFileName()
                    .toString()
                    .toLowerCase();

            if (fileName.endsWith(".png")) {
                contentType = "image/png";
            } else if (fileName.endsWith(".jpg")
                    || fileName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (fileName.endsWith(".webp")) {
                contentType = "image/webp";
            }
        }

        if (contentType == null || !List.of(
                "image/jpeg",
                "image/png",
                "image/webp"
        ).contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported image type"
            );
        }

        Resource resource = new UrlResource(imagePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}