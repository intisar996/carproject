
package com.example.Car.Services.Repository;


import com.example.Car.Services.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {


    interface GarageRatingSummary { Long getGarageId();Double getAverageRating();Long getRatingCount();}

    boolean existsByServiceRequest_RequestId(Long requestId);

    Optional<Rating> findByServiceRequest_RequestId(Long requestId);

    @Query("""
        SELECT g.id AS garageId,
            AVG(r.stars) AS averageRating,
            COUNT(r.id) AS ratingCount
        FROM Rating r
        JOIN r.serviceRequest sr
        JOIN sr.garageServiceOption gso
        JOIN gso.garage g
        WHERE g.id IN :garageIds
        GROUP BY g.id""")
    List<GarageRatingSummary> findRatingSummaryByGarageIds(@Param("garageIds") List<Long> garageIds);



}
