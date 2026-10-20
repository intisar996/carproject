package com.example.Car.Services.Interface.Technician;

import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.enums.PhotoType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RepairPhotoServiceInterface {

    RepairPhoto uploadPhoto(
            Long requestId,
            PhotoType photoType,
            MultipartFile file,
            Long technicianUserId
    );

    List<RepairPhoto> getPhotos(
            Long requestId,
            Long technicianUserId
    );

    List<RepairPhoto> getOwnerPhotos(Long requestId, Long ownerId);
}