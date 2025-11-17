package com.example.supply_manager.repository;

import com.example.supply_manager.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    long countByStatus(PurchaseOrder.Status status);
    
    List<PurchaseOrder> findByStatus(PurchaseOrder.Status status);
}
