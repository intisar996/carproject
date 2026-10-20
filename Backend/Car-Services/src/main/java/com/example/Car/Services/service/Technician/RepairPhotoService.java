package com.example.Car.Services.service.Technician;

import com.example.Car.Services.Interface.Technician.RepairPhotoServiceInterface;
import com.example.Car.Services.Repository.RepairPhotoRepository;
import com.example.Car.Services.Repository.TechnicianAssignmentRepository;
import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.enums.AssignmentStatus;
import com.example.Car.Services.enums.PhotoType;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.service.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RepairPhotoService implements RepairPhotoServiceInterface {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final RepairPhotoRepository repairPhotoRepository;
    private final TechnicianAssignmentRepository assignmentRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public RepairPhoto uploadPhoto(
            Long requestId,
            PhotoType photoType,
            MultipartFile file,
            Long technicianUserId
    ) {
        TechnicianAssignment assignment =
                findTechnicianAssignment(requestId, technicianUserId);

        if (photoType == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Photo type is required"
            );
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Image file is required"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Image must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !Set.of(
                "image/jpeg", "image/png", "image/webp"
        ).contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only JPG, PNG and WebP images are allowed"
            );
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null
                || originalName.contains("/")
                || originalName.contains("\\")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid image filename"
            );
        }

        String storedFileName = fileStorageService.storeRepairPhoto(file);

        RepairPhoto photo = new RepairPhoto();
        photo.setServiceRequest(assignment.getServiceRequest());
        photo.setPhotoType(photoType);
        photo.setImageUrl(storedFileName);

        return repairPhotoRepository.save(photo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairPhoto> getPhotos(
            Long requestId,
            Long technicianUserId
    ) {
        findTechnicianAssignment(requestId, technicianUserId);

        return repairPhotoRepository
                .findByServiceRequest_RequestIdOrderByCapturedAtAsc(requestId);
    }









    private TechnicianAssignment findTechnicianAssignment(
            Long requestId,
            Long technicianUserId
    ) {
        if (requestId == null || technicianUserId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Request and technician are required"
            );
        }

        TechnicianAssignment assignment = assignmentRepository
                .findFirstByServiceRequest_RequestIdAndTechnician_User_IdOrderByAssignedAtDesc(
                        requestId, technicianUserId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Technician is not assigned to this request"
                ));

        if (assignment.getStatus() == AssignmentStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Assignment is cancelled"
            );
        }

        return assignment;
    }




    @Override
    @Transactional(readOnly = true)
    public List<RepairPhoto> getOwnerPhotos(Long requestId, Long ownerId) {

        TechnicianAssignment assignment = assignmentRepository.findFirstByServiceRequest_RequestIdOrderByAssignedAtDesc(requestId)
                        .orElseThrow(() -> new BadRequestException("Technician assignment not found"));

        Long requestOwnerId = assignment.getServiceRequest()
                .getGarageServiceOption()
                .getGarage()
                .getOwnerId();

        if (!requestOwnerId.equals(ownerId)) {
            throw new BadRequestException("You are not allowed to view these photos");
        }

        return repairPhotoRepository.findByServiceRequest_RequestIdOrderByCapturedAtAsc(requestId);
    }
}