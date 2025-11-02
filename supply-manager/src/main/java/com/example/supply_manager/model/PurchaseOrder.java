package com.example.supply_manager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // número do pedido (pode ser PO-2025-0001)
    private String code;

    @ManyToOne
    private Supplier supplier;

    private LocalDate orderDate;          // data da compra
    private LocalDate expectedDate;       // data de previsão
    private LocalDate deliveryDate;       // data de entrega REAL

    public enum Status {
        DRAFT, ISSUED, PARTIALLY_RECEIVED, RECEIVED, CANCELED
    }

    @Enumerated(EnumType.STRING)
    private Status status;

    private Double totalAmount;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items;

    // marcador de que chegou tudo
    private Boolean fullyReceived;

    // getters e setters
}
