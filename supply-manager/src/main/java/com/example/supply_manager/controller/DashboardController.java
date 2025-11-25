package com.example.supply_manager.controller;

import com.example.supply_manager.model.Product;
import com.example.supply_manager.model.PurchaseOrder;
import com.example.supply_manager.repository.ProductRepository;
import com.example.supply_manager.repository.PurchaseOrderRepository;
import com.example.supply_manager.repository.SupplierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public DashboardController(SupplierRepository supplierRepository,
                               ProductRepository productRepository,
                               PurchaseOrderRepository purchaseOrderRepository) {
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Contar fornecedores
        long fornecedoresCount = supplierRepository.count();
        metrics.put("fornecedores", fornecedoresCount);

        // Contar produtos
        long produtosCount = productRepository.count();
        metrics.put("produtos", produtosCount);

        // Compras pendentes (DRAFT ou ISSUED)
        long comprasPendentesCount =
                purchaseOrderRepository.countByStatus(PurchaseOrder.Status.DRAFT) +
                purchaseOrderRepository.countByStatus(PurchaseOrder.Status.ISSUED);
        metrics.put("comprasPendentes", comprasPendentesCount);

        // Estoque total (por enquanto ainda 0; se tiver campo de quantidade depois dá pra ajustar)
        metrics.put("estoqueTotal", 0);

        // 🔹 Valor em entregas futuras = SOMENTE DRAFT + ISSUED (como já estava antes)
        double valorEntregasFuturas = 0.0;
        for (PurchaseOrder.Status status : new PurchaseOrder.Status[]{
                PurchaseOrder.Status.DRAFT,
                PurchaseOrder.Status.ISSUED
        }) {
            valorEntregasFuturas += purchaseOrderRepository.findByStatus(status).stream()
                    .mapToDouble(po -> po.getTotalAmount() != null ? po.getTotalAmount() : 0.0)
                    .sum();
        }
        metrics.put("valorEntregasFuturas", valorEntregasFuturas);

        // 🔹 Valor total em estoque = pedidos NÃO pendentes
        // (tudo que não é DRAFT nem ISSUED é considerado "entregue/concluído")
        double valorEstoque = purchaseOrderRepository.findAll().stream()
                .filter(po ->
                        po.getStatus() != PurchaseOrder.Status.DRAFT &&
                        po.getStatus() != PurchaseOrder.Status.ISSUED
                )
                .mapToDouble(po -> po.getTotalAmount() != null ? po.getTotalAmount() : 0.0)
                .sum();
        metrics.put("valorEstoque", valorEstoque);

        return ResponseEntity.ok(metrics);
    }
}
