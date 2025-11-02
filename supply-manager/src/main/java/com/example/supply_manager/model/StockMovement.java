package com.example.supply_manager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Double quantity;
    @Enumerated(EnumType.STRING)
    private MovementType type;
    
    public enum MovementType {
        IN, OUT
    }

    private LocalDateTime movementDate;

    private String reference; // "PO-2025-0001"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private WarehouseLocation location;

    @PrePersist
    protected void onCreate() {
        this.movementDate = LocalDateTime.now();
    }
}
