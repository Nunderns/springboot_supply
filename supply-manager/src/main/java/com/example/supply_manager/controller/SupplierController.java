package com.example.supply_manager.controller;

import com.example.supply_manager.model.Supplier;
import com.example.supply_manager.repository.SupplierRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5173", "http://127.0.0.1:3000"})
public class SupplierController {
    private final SupplierRepository repository;

    public SupplierController(SupplierRepository repository){
        this.repository = repository;
    }

    @GetMapping
    public List<Supplier> getAll(){
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Supplier getById(@PathVariable Long id){
        return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
    }

    @PostMapping
    public Supplier create(@RequestBody Supplier supplier){
        return repository.save(supplier);
    }

    @PutMapping("/{id}")
    public Supplier update(@PathVariable Long id, @RequestBody Supplier supplier) {
        return repository.save(supplier);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
    
    @GetMapping("/search")
    public List<Supplier> searchSuppliers(@RequestParam String query) {
        return repository.findByNameContainingIgnoreCase(query);
    }
}
