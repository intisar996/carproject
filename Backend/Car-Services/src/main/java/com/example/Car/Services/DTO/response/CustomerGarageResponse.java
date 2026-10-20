package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.GarageServiceOption;
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
public class CustomerGarageResponse {

    private Long garageId;
    private String garageName;
    private String governorate;
    private String state;
    private BigDecimal latitude;
    private BigDecimal longitude;

    private Long garageOptionId;
    private Long serviceOptionId;

    private String optionType;
    private String optionSize;
    private String optionBrand;

    private BigDecimal price;


    public static CustomerGarageResponse convertTo(
            GarageServiceOption garageServiceOption) {

        if (garageServiceOption == null) {
            return null;
        }

        return CustomerGarageResponse.builder()
                .garageId(garageServiceOption.getGarage().getId())
                .garageName(garageServiceOption.getGarage().getName())
                .governorate(garageServiceOption.getGarage().getGovernorate())
                .state(garageServiceOption.getGarage().getState())
                .latitude(garageServiceOption.getGarage().getLatitude())
                .longitude(garageServiceOption.getGarage().getLongitude())

                .garageOptionId(garageServiceOption.getGarageOptionId())
                .serviceOptionId(
                        garageServiceOption
                                .getServiceOption()
                                .getServiceOptionId()
                )

                .optionType(
                        garageServiceOption
                                .getServiceOption()
                                .getType()
                )
                .optionSize(
                        garageServiceOption
                                .getServiceOption()
                                .getSize()
                )
                .optionBrand(
                        garageServiceOption
                                .getServiceOption()
                                .getBrand()
                )

                .price(garageServiceOption.getPrice())
                .build();
    }


    public static List<CustomerGarageResponse> convertToList(
            List<GarageServiceOption> garageServiceOptions) {

        if (garageServiceOptions == null ||
                garageServiceOptions.isEmpty()) {

            return Collections.emptyList();
        }

        return garageServiceOptions.stream()
                .map(CustomerGarageResponse::convertTo)
                .collect(Collectors.toList());
    }
}