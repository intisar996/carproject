package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.RepairPhoto;
import com.example.Car.Services.enums.PhotoType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairPhotoRepository extends JpaRepository<RepairPhoto, Long> {

    List<RepairPhoto> findByServiceRequest_RequestIdOrderByCapturedAtAsc(Long requestId);


    List<RepairPhoto> findByServiceRequest_RequestIdAndPhotoTypeOrderByCapturedAtAsc(Long requestId, PhotoType photoType);
}