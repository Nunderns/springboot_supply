package com.example.supply_manager.controller;

import com.example.supply_manager.model.PurchaseOrder;
import com.example.supply_manager.model.PurchaseOrderItem;
import com.example.supply_manager.repository.PurchaseOrderItemRepository;
import com.example.supply_manager.repository.PurchaseOrderRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseOrderController {

    private final PurchaseOrderRepository orderRepo;
    private final PurchaseOrderItemRepository itemRepo;

    public PurchaseOrderController(PurchaseOrderRepository orderRepo, PurchaseOrderItemRepository itemRepo) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
    }

    // Lista todos os pedidos
    @GetMapping
    public List<PurchaseOrder> getAll() {
        return orderRepo.findAll();
    }

    // Busca um pedido específico
    @GetMapping("/{id}")
    public PurchaseOrder getById(@PathVariable Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido de compra não encontrado"));
    }

    // Cria um novo pedido de compra
    @PostMapping
    public PurchaseOrder create(@RequestBody PurchaseOrder order) {
        order.setStatus(PurchaseOrder.Status.ISSUED);
        order.setFullyReceived(false);
        order.setOrderDate(LocalDate.now());

        double total = 0;
        if (order.getItems() != null) {
            for (PurchaseOrderItem i : order.getItems()) {
                i.setPurchaseOrder(order);
                double price = i.getUnitPrice() != null ? i.getUnitPrice() : 0;
                double qty = i.getQuantity() != null ? i.getQuantity() : 0;
                total += price * qty;
            }
        }

        order.setTotalAmount(total);
        return orderRepo.save(order);
    }

    // Atualiza um pedido de compra
    @PutMapping("/{id}")
    public PurchaseOrder update(@PathVariable Long id, @RequestBody PurchaseOrder order) {
        order.setId(id);
        return orderRepo.save(order);
    }

    // Deleta um pedido
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderRepo.deleteById(id);
    }

    // Marca recebimento parcial de item
    @PostMapping("/{orderId}/items/{itemId}/receive")
    public PurchaseOrder receiveItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody ReceiveRequest req
    ) {
        PurchaseOrderItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        double received = item.getReceivedQuantity() == null ? 0 : item.getReceivedQuantity();
        item.setReceivedQuantity(received + req.quantity());
        itemRepo.save(item);

        PurchaseOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        boolean allReceived = order.getItems().stream()
                .allMatch(i -> i.getReceivedQuantity() != null &&
                               i.getReceivedQuantity() >= i.getQuantity());

        if (allReceived) {
            order.setStatus(PurchaseOrder.Status.RECEIVED);
            order.setDeliveryDate(LocalDate.now());
            order.setFullyReceived(true);
        } else {
            order.setStatus(PurchaseOrder.Status.PARTIALLY_RECEIVED);
        }

        return orderRepo.save(order);
    }

    public record ReceiveRequest(Double quantity) {}
}
