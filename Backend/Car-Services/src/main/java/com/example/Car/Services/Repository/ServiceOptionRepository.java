package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.ServiceOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOptionRepository
        extends JpaRepository<ServiceOption, Long> {

    List<ServiceOption> findByService_ServiceId(Long serviceId);

    boolean existsByService_ServiceId(Long serviceId);
}