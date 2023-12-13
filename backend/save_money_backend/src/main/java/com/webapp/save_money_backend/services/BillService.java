package com.webapp.save_money_backend.services;

import com.webapp.save_money_backend.models.entities.Bill;

import java.util.List;

public interface BillService {
    List<Bill> findAll();
}
