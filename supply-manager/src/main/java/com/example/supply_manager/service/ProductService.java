package com.example.supply_manager.service;

import com.example.supply_manager.dto.ProductDTO;
import com.example.supply_manager.model.Product;
import com.example.supply_manager.model.Supplier;
import com.example.supply_manager.repository.ProductRepository;
import com.example.supply_manager.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.example.supply_manager.dto.ProductMapper;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = ProductMapper.toEntity(productDTO);
        
        // Set preferred supplier if provided
        if (productDTO.getPreferredSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(productDTO.getPreferredSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + productDTO.getPreferredSupplierId()));
            product.setPreferredSupplier(supplier);
        }
        
        Product savedProduct = productRepository.save(product);
        return ProductMapper.toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        
        // Update fields from DTO
        existingProduct.setSku(productDTO.getSku());
        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setWidth(productDTO.getWidth());
        existingProduct.setHeight(productDTO.getHeight());
        existingProduct.setLength(productDTO.getLength());
        existingProduct.setWeight(productDTO.getWeight());
        existingProduct.setVolume(productDTO.getVolume());
        existingProduct.setUnit(productDTO.getUnit());
        existingProduct.setDefaultPrice(productDTO.getDefaultPrice());
        existingProduct.setActive(productDTO.isActive());
        
        // Update preferred supplier if provided
        if (productDTO.getPreferredSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(productDTO.getPreferredSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + productDTO.getPreferredSupplierId()));
            existingProduct.setPreferredSupplier(supplier);
        } else {
            existingProduct.setPreferredSupplier(null);
        }
        
        Product updatedProduct = productRepository.save(existingProduct);
        return ProductMapper.toDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        
        // Soft delete by setting active to false
        product.setActive(false);
        productRepository.save(product);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return ProductMapper.toDTO(product);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<ProductDTO> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(ProductMapper::toDTO);
    }

    public List<ProductDTO> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(query, query).stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());
    }
}

