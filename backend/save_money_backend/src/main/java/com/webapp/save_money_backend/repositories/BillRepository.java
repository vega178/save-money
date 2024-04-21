package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.Bill;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends CrudRepository<Bill, Long> {
    List<Bill> findByUserId(Long id);
}
