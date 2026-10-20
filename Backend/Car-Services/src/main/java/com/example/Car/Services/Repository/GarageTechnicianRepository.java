package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GarageTechnicianRepository
        extends JpaRepository<Technician, Long> {

    List<Technician> findByGarageId(Long garageId);

    Optional<Technician> findByUserId(Long userId);

    Optional<Technician> findByIdAndGarageId(
            Long technicianId,
            Long garageId
    );
}

