package com.webapp.save_money_backend.services;

import com.webapp.save_money_backend.models.entities.Bill;

import java.util.List;
import java.util.Optional;

public interface BillService {
    List<Bill> findAll();
    Optional<Bill> findById(Long id);
    Bill save(Bill bill);
    Optional<Bill> update(Bill bill, Long id);
    void remove(Long id);
    List<Bill> getBillsByUserId(Long user_id);
    Bill save(Bill bill, Long user_id);
}
