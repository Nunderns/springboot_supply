package com.example.supply_manager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "warehouse_locations")
public class WarehouseLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // EX: A-01-03
    
    @Column(length = 500)
    private String description;

    @Column(name = "capacity_volume", nullable = false)
    private Double capacityVolume; // m³ total
    
    @Column(name = "used_volume", nullable = false)
    private Double usedVolume = 0.0;     // m³ usado
    
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockMovement> stockMovements = new ArrayList<>();

    // Business methods
    public boolean hasAvailableSpace(double volume) {
        return (capacityVolume - usedVolume) >= volume;
    }
    
    public void allocateSpace(double volume) {
        if (!hasAvailableSpace(volume)) {
            throw new IllegalStateException("Not enough space available in location: " + code);
        }
        this.usedVolume += volume;
    }
    
    public void releaseSpace(double volume) {
        if (this.usedVolume < volume) {
            throw new IllegalStateException("Cannot release more space than is currently used");
        }
        this.usedVolume -= volume;
    }
}