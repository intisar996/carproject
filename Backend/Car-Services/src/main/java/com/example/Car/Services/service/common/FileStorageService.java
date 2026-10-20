package com.example.Car.Services.service.common;

import com.example.Car.Services.expection.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.request-file-dir}")
    private String uploadDir;

    @Value("${file.repair-photo-dir:uploads/repair-photos}")
    private String repairPhotoDir;

    public String storeFile(MultipartFile file) {
        return storeInDirectory(file, uploadDir);
    }

    public String storeRepairPhoto(MultipartFile file) {
        return storeInDirectory(file, repairPhotoDir);
    }

    private String storeInDirectory(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String originalName = file.getOriginalFilename();
        String safeName = originalName == null
                ? "image"
                : Paths.get(originalName.replace("\\", "/"))
                .getFileName()
                .toString();

        String fileName = UUID.randomUUID() + "_" + safeName;

        try {
            Path uploadPath = Paths.get(directory)
                    .toAbsolutePath()
                    .normalize();

            File uploadDirectory = uploadPath.toFile();

            if (!uploadDirectory.exists() && !uploadDirectory.mkdirs()) {
                throw new BadRequestException("Failed to create upload directory");
            }

            Path destinationPath = uploadPath.resolve(fileName).normalize();

            if (!destinationPath.startsWith(uploadPath)) {
                throw new BadRequestException("Invalid file path");
            }

            file.transferTo(destinationPath.toFile());

            return fileName;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }
}