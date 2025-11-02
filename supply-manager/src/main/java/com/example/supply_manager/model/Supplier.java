package com.example.supply_manager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String name;
    private String cnpj;
    private String email;
    private String address;

    private String notes;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrder> purchaseOrders = new java.util.ArrayList<>();

    // Helper methods for bidirectional relationship
    public void addPurchaseOrder(PurchaseOrder order) {
        purchaseOrders.add(order);
        order.setSupplier(this);
    }

    public void removePurchaseOrder(PurchaseOrder order) {
        purchaseOrders.remove(order);
        order.setSupplier(null);
    }
}
