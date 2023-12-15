package com.webapp.save_money_backend.services;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.repositories.BillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class BillServiceImpl implements BillService {
    @Autowired
    private BillRepository billRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Bill> findAll() {
        return (List<Bill>) billRepository.findAll();
    }
}
