package com.example.supply_manager.controller;

import com.example.supply_manager.model.*;
import com.example.supply_manager.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseController {

    private final PurchaseOrderRepository orderRepo;
    private final PurchaseOrderItemRepository itemRepo;
    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;

    public PurchaseController(
            PurchaseOrderRepository orderRepo,
            PurchaseOrderItemRepository itemRepo,
            SupplierRepository supplierRepo,
            ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.supplierRepo = supplierRepo;
        this.productRepo = productRepo;
    }

    // DTO para receber dados do frontend
    public static class PurchaseRequest {
        public Long id;
        public Object supplier; // pode ser número ou objeto
        public String purchaseDate;
        public String expectedDeliveryDate;
        public String deliveryDate;
        public String status; // PENDING, DELIVERED, CANCELED
        public List<PurchaseItemRequest> items;
        public Double total;
        public String notes;
    }

    public static class PurchaseItemRequest {
        public Long id;
        public Object product; // pode ser número ou objeto
        public Integer quantity;
        public Double unitPrice;
        public Double total;
    }

    // DTO para retornar dados ao frontend
    public static class PurchaseResponse {
        public Long id;
        public Object supplier;
        public String purchaseDate;
        public String expectedDeliveryDate;
        public String deliveryDate;
        public String status;
        public List<PurchaseItemResponse> items;
        public Double total;
        public String notes;
        public String createdAt;
        public String updatedAt;

        public PurchaseResponse(PurchaseOrder order) {
            this.id = order.getId();
            this.supplier = order.getSupplier();
            this.purchaseDate = order.getOrderDate() != null ? order.getOrderDate().toString() : null;
            this.expectedDeliveryDate = order.getExpectedDate() != null ? order.getExpectedDate().toString() : null;
            this.deliveryDate = order.getDeliveryDate() != null ? order.getDeliveryDate().toString() : null;
            
            // Mapear status do backend para o frontend
            if (order.getStatus() != null) {
                switch (order.getStatus()) {
                    case ISSUED -> this.status = "PENDING";
                    case RECEIVED -> this.status = "DELIVERED";
                    case CANCELED -> this.status = "CANCELED";
                    case DRAFT -> this.status = "PENDING";
                    case PARTIALLY_RECEIVED -> this.status = "PENDING";
                    default -> this.status = "PENDING";
                }
            } else {
                this.status = "PENDING";
            }
            
            this.total = order.getTotalAmount();
            this.items = order.getItems() != null ? 
                order.getItems().stream().map(PurchaseItemResponse::new).collect(Collectors.toList()) : 
                new ArrayList<>();
        }
    }

    public static class PurchaseItemResponse {
        public Long id;
        public Object product;
        public Integer quantity;
        public Double unitPrice;
        public Double total;

        public PurchaseItemResponse(PurchaseOrderItem item) {
            this.id = item.getId();
            this.product = item.getProduct();
            this.quantity = item.getQuantity() != null ? item.getQuantity().intValue() : 0;
            this.unitPrice = item.getUnitPrice();
            this.total = item.getQuantity() != null && item.getUnitPrice() != null ? 
                item.getQuantity() * item.getUnitPrice() : 0.0;
        }
    }

    // GET all com paginação
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PurchaseOrder> orderPage = orderRepo.findAll(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", orderPage.getContent().stream()
                .map(PurchaseResponse::new)
                .collect(Collectors.toList()));
            response.put("totalElements", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());
            response.put("size", orderPage.getSize());
            response.put("number", orderPage.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET by id
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getById(@PathVariable Long id) {
        PurchaseOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));
        return ResponseEntity.ok(new PurchaseResponse(order));
    }

    // POST create
    @PostMapping
    public ResponseEntity<PurchaseResponse> create(@RequestBody PurchaseRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        
        // Mapear fornecedor
        Long supplierId = null;
        if (request.supplier instanceof Number) {
            supplierId = ((Number) request.supplier).longValue();
        } else if (request.supplier instanceof Map) {
            Object idObj = ((Map<?, ?>) request.supplier).get("id");
            if (idObj instanceof Number) {
                supplierId = ((Number) idObj).longValue();
            }
        }
        
        if (supplierId != null) {
            Supplier supplier = supplierRepo.findById(supplierId)
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
            order.setSupplier(supplier);
        }
        
        // Mapear datas
        if (request.purchaseDate != null) {
            order.setOrderDate(LocalDate.parse(request.purchaseDate));
        } else {
            order.setOrderDate(LocalDate.now());
        }
        
        if (request.expectedDeliveryDate != null) {
            order.setExpectedDate(LocalDate.parse(request.expectedDeliveryDate));
        }
        
        if (request.deliveryDate != null) {
            order.setDeliveryDate(LocalDate.parse(request.deliveryDate));
        }
        
        // Mapear status
        if (request.status != null) {
            switch (request.status.toUpperCase()) {
                case "PENDING" -> order.setStatus(PurchaseOrder.Status.ISSUED);
                case "DELIVERED" -> order.setStatus(PurchaseOrder.Status.RECEIVED);
                case "CANCELED" -> order.setStatus(PurchaseOrder.Status.CANCELED);
                default -> order.setStatus(PurchaseOrder.Status.ISSUED);
            }
        } else {
            order.setStatus(PurchaseOrder.Status.ISSUED);
        }
        
        order.setFullyReceived(false);
        
        // Calcular total e mapear itens
        double total = 0.0;
        List<PurchaseOrderItem> items = new ArrayList<>();
        
        if (request.items != null) {
            for (PurchaseItemRequest itemReq : request.items) {
                PurchaseOrderItem item = new PurchaseOrderItem();
                
                // Mapear produto
                Long productId = null;
                if (itemReq.product instanceof Number) {
                    productId = ((Number) itemReq.product).longValue();
                } else if (itemReq.product instanceof Map) {
                    Object idObj = ((Map<?, ?>) itemReq.product).get("id");
                    if (idObj instanceof Number) {
                        productId = ((Number) idObj).longValue();
                    }
                }
                
                if (productId != null) {
                    Product product = productRepo.findById(productId)
                            .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
                    item.setProduct(product);
                }
                
                item.setQuantity(itemReq.quantity != null ? itemReq.quantity.doubleValue() : 0.0);
                item.setUnitPrice(itemReq.unitPrice);
                item.setPurchaseOrder(order);
                
                double itemTotal = item.getQuantity() * (item.getUnitPrice() != null ? item.getUnitPrice() : 0.0);
                total += itemTotal;
                
                items.add(item);
            }
        }
        
        order.setItems(items);
        order.setTotalAmount(total);
        
        PurchaseOrder saved = orderRepo.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(new PurchaseResponse(saved));
    }

    // PUT update
    @PutMapping("/{id}")
    public ResponseEntity<PurchaseResponse> update(
            @PathVariable Long id,
            @RequestBody PurchaseRequest request) {
        PurchaseOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));
        
        // Mapear fornecedor
        Long supplierId = null;
        if (request.supplier instanceof Number) {
            supplierId = ((Number) request.supplier).longValue();
        } else if (request.supplier instanceof Map) {
            Object idObj = ((Map<?, ?>) request.supplier).get("id");
            if (idObj instanceof Number) {
                supplierId = ((Number) idObj).longValue();
            }
        }
        
        if (supplierId != null) {
            Supplier supplier = supplierRepo.findById(supplierId)
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
            order.setSupplier(supplier);
        }
        
        // Mapear datas
        if (request.purchaseDate != null) {
            order.setOrderDate(LocalDate.parse(request.purchaseDate));
        }
        
        if (request.expectedDeliveryDate != null) {
            order.setExpectedDate(LocalDate.parse(request.expectedDeliveryDate));
        }
        
        if (request.deliveryDate != null) {
            order.setDeliveryDate(LocalDate.parse(request.deliveryDate));
        }
        
        // Mapear status
        if (request.status != null) {
            switch (request.status.toUpperCase()) {
                case "PENDING" -> order.setStatus(PurchaseOrder.Status.ISSUED);
                case "DELIVERED" -> order.setStatus(PurchaseOrder.Status.RECEIVED);
                case "CANCELED" -> order.setStatus(PurchaseOrder.Status.CANCELED);
                default -> order.setStatus(PurchaseOrder.Status.ISSUED);
            }
        }
        
        // Limpar itens antigos (cascade vai cuidar disso)
        if (order.getItems() != null) {
            order.getItems().clear();
        }
        
        // Adicionar novos itens
        double total = 0.0;
        List<PurchaseOrderItem> items = new ArrayList<>();
        
        if (request.items != null) {
            for (PurchaseItemRequest itemReq : request.items) {
                PurchaseOrderItem item = new PurchaseOrderItem();
                
                Long productId = null;
                if (itemReq.product instanceof Number) {
                    productId = ((Number) itemReq.product).longValue();
                } else if (itemReq.product instanceof Map) {
                    Object idObj = ((Map<?, ?>) itemReq.product).get("id");
                    if (idObj instanceof Number) {
                        productId = ((Number) idObj).longValue();
                    }
                }
                
                if (productId != null) {
                    Product product = productRepo.findById(productId)
                            .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
                    item.setProduct(product);
                }
                
                item.setQuantity(itemReq.quantity != null ? itemReq.quantity.doubleValue() : 0.0);
                item.setUnitPrice(itemReq.unitPrice);
                item.setPurchaseOrder(order);
                
                double itemTotal = item.getQuantity() * (item.getUnitPrice() != null ? item.getUnitPrice() : 0.0);
                total += itemTotal;
                
                items.add(item);
            }
        }
        
        order.setItems(items);
        order.setTotalAmount(total);
        
        PurchaseOrder saved = orderRepo.save(order);
        return ResponseEntity.ok(new PurchaseResponse(saved));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!orderRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH status
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        PurchaseOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));
        
        String status = request.get("status");
        if (status != null) {
            switch (status.toUpperCase()) {
                case "PENDING" -> order.setStatus(PurchaseOrder.Status.ISSUED);
                case "DELIVERED" -> {
                    order.setStatus(PurchaseOrder.Status.RECEIVED);
                    order.setDeliveryDate(LocalDate.now());
                    order.setFullyReceived(true);
                }
                case "CANCELED" -> order.setStatus(PurchaseOrder.Status.CANCELED);
            }
        }
        
        PurchaseOrder saved = orderRepo.save(order);
        return ResponseEntity.ok(new PurchaseResponse(saved));
    }

    // GET search
    @GetMapping("/search")
    public ResponseEntity<List<PurchaseResponse>> search(@RequestParam String query) {
        // Busca simples por ID ou código
        List<PurchaseOrder> orders = orderRepo.findAll();
        List<PurchaseResponse> results = orders.stream()
                .filter(order -> {
                    if (order.getId() != null && order.getId().toString().contains(query)) {
                        return true;
                    }
                    if (order.getCode() != null && order.getCode().contains(query)) {
                        return true;
                    }
                    if (order.getSupplier() != null && order.getSupplier().getName() != null &&
                        order.getSupplier().getName().toLowerCase().contains(query.toLowerCase())) {
                        return true;
                    }
                    return false;
                })
                .map(PurchaseResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(results);
    }
}

