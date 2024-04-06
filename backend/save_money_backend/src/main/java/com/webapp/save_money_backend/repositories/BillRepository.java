package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.models.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends CrudRepository<Bill, Long> {
    /*List<Bill> findBillByUserId(Long id);*/
}
