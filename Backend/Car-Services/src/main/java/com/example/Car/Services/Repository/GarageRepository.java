package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.enums.GarageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GarageRepository extends JpaRepository<Garage, Long> {
    List<Garage> findByOwnerId(Long ownerId);
    Optional<Garage> findByIdAndOwnerId(Long id, Long ownerId);

    List<Garage> findByOwnerIdAndStatus(Long ownerId, GarageStatus status);

}