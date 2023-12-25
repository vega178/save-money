package com.webapp.save_money_backend.controllers;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.services.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "http://localhost:3000")
public class BillController {
    @Autowired
    private BillService service;

    @GetMapping()
    public List<Bill> findAll() {
       return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> find(@PathVariable Long id) {
        Optional<Bill> bill = service.findById(id);
        if (bill.isPresent()) {
            return ResponseEntity.ok(bill.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Bill bill) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(bill));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestBody Bill bill, @PathVariable Long id) {
        Optional<Bill> billToUpdate = service.update(bill, id);
        if (billToUpdate.isPresent()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(billToUpdate.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable Long id) {
        Optional<Bill> billToRemove = service.findById(id);
        if (billToRemove.isPresent()) {
            service.remove(id);
            return ResponseEntity.noContent().build(); //204
        }
        return ResponseEntity.notFound().build();
    }
}
