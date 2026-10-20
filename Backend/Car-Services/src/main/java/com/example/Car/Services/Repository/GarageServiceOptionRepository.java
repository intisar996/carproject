package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.GarageServiceOption;
import com.example.Car.Services.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface GarageServiceOptionRepository
        extends JpaRepository<GarageServiceOption, Long> {

    List<GarageServiceOption> findByGarageId(Long garageId);

    Optional<GarageServiceOption> findByGarageOptionIdAndGarageId(
            Long garageOptionId,
            Long garageId
    );

    boolean existsByGarageIdAndServiceOptionServiceOptionId(
            Long garageId,
            Long serviceOptionId
    );

    @Query("""
    SELECT gso
    FROM GarageServiceOption gso
    JOIN FETCH gso.garage g
    JOIN gso.serviceOption so
    WHERE so.service.serviceId = :serviceId
      AND gso.isAvailable = true
      AND g.status = com.example.Car.Services.enums.GarageStatus.ACTIVE
      AND EXISTS (
          SELECT s.id
          FROM OWNER_SUBSCRIPTION s
          WHERE s.garage.id = g.id
            AND s.status = :subscriptionStatus
            AND s.endDate > :now
      )
""")
    List<GarageServiceOption> findAvailableGaragesByService(
            @Param("serviceId") Long serviceId,
            @Param("subscriptionStatus") SubscriptionStatus subscriptionStatus,
            @Param("now") Instant now
    );

}