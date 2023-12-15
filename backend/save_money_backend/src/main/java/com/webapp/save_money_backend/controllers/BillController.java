package com.webapp.save_money_backend.controllers;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.services.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class BillController {
    @Autowired
    private BillService service;

    @GetMapping("/bills")
    public List<Bill> findAll() {
       return service.findAll();
    }
}
