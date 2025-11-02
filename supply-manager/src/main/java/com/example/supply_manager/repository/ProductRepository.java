package com.example.supply_manager.repository;

import com.example.supply_manager.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Search products by name or SKU (case-insensitive)
    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku);
    
    // Find all active products
    List<Product> findByActiveTrue();
    
    // Find all products by supplier
    List<Product> findByPreferredSupplierId(Long supplierId);
    
    // Find all active products with pagination
    Page<Product> findByActiveTrue(Pageable pageable);
    
    // Find products by name or SKU with pagination
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(concat('%', :query, '%')) OR LOWER(p.sku) LIKE LOWER(concat('%', :query, '%'))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
    
    // Check if a product with the given SKU exists (case-insensitive)
    boolean existsBySkuIgnoreCase(String sku);
    
    // Find product by SKU (case-insensitive)
    Product findBySkuIgnoreCase(String sku);
}
