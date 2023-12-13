package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.Bill;
import org.springframework.data.repository.CrudRepository;

public interface BillRepository extends CrudRepository<Bill, Long> {
}
