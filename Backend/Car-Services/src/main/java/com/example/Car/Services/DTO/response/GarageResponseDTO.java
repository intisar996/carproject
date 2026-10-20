package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.enums.GarageStatus;
import lombok.*;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GarageResponseDTO {
    private Long id;
    private Long ownerId;
    private String name;
    private String governorate;
    private String state;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private GarageStatus status;



    public static GarageResponseDTO convertTo(Garage garage) {
        if (garage == null) {
            return null;
        }
        return GarageResponseDTO.builder()
                .id(garage.getId())
                .ownerId(garage.getOwnerId())
                .name(garage.getName())
                .governorate(garage.getGovernorate())
                .state(garage.getState())
                .latitude(garage.getLatitude())
                .longitude(garage.getLongitude())
                .phone(garage.getPhone())
                .status(garage.getStatus())
                .build();
    }

    public static List<GarageResponseDTO> convertToList(List<Garage> garages) {
        if (garages == null || garages.isEmpty()) {
            return Collections.emptyList();
        }
        return garages.stream()
                .map(GarageResponseDTO::convertTo)
                .collect(Collectors.toList());
    }
}