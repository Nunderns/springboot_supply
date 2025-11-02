package com.example.supply_manager.dto;

import com.example.supply_manager.model.Product;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Mapper class to convert between Product Entity and ProductDTO
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ProductMapper {
    
    public static ProductDTO toDTO(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setWidth(product.getWidth());
        dto.setHeight(product.getHeight());
        dto.setLength(product.getLength());
        dto.setWeight(product.getWeight());
        dto.setVolume(product.getVolume());
        dto.setUnit(product.getUnit());
        dto.setDefaultPrice(product.getDefaultPrice());
        
        if (product.getPreferredSupplier() != null) {
            dto.setPreferredSupplierId(product.getPreferredSupplier().getId());
        }
        
        dto.setActive(product.isActive());
        return dto;
    }
    
    public static Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Product product = new Product();
        updateEntityFromDTO(product, dto);
        return product;
    }
    
    public static void updateEntityFromDTO(Product product, ProductDTO dto) {
        product.setId(dto.getId());
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setWidth(dto.getWidth());
        product.setHeight(dto.getHeight());
        product.setLength(dto.getLength());
        product.setWeight(dto.getWeight());
        product.setVolume(dto.getVolume());
        product.setUnit(dto.getUnit());
        product.setDefaultPrice(dto.getDefaultPrice());
        product.setActive(dto.isActive());
        // Note: preferredSupplier should be set in the service layer
    }
}
