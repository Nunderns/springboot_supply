package com.example.supply_manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class ProductDTO {
    private Long id;
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @PositiveOrZero(message = "Width must be a positive number")
    private Double width;
    
    @PositiveOrZero(message = "Height must be a positive number")
    private Double height;
    
    @PositiveOrZero(message = "Length must be a positive number")
    private Double length;
    
    @PositiveOrZero(message = "Weight must be a positive number")
    private Double weight;
    
    @PositiveOrZero(message = "Volume must be a positive number")
    private Double volume;
    
    private String unit;
    
    @PositiveOrZero(message = "Price must be a positive number")
    private BigDecimal defaultPrice;
    
    private Long preferredSupplierId;
    
    private boolean active = true;
}
