package com.example.supply_manager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // quantidade pedida
    private Double quantity;

    // quantidade recebida
    private Double receivedQuantity;

    // preço unitário no momento da compra
    private Double unitPrice;

    // descrição / observação específica pro item
    private String itemDescription;

    // local de armazenagem sugerido
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_location_id")
    private WarehouseLocation suggestedLocation;

    // getters e setters
}
