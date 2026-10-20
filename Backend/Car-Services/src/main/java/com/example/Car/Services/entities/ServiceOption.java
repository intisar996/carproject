package com.example.Car.Services.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "service_options")
public class ServiceOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceOptionId;

    private String type;
    private String size;
    private String brand;

//    @Column(nullable = false, precision = 10, scale = 3)
//    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    public ServiceOption() {
    }

    public Long getServiceOptionId() {
        return serviceOptionId;
    }

    public void setServiceOptionId(Long serviceOptionId) {
        this.serviceOptionId = serviceOptionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }
//
//    public BigDecimal getPrice() {
//        return price;
//    }

//    public void setPrice(BigDecimal price) {
//        this.price = price;
//    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }
}