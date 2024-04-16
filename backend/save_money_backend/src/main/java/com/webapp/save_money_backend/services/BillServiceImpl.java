package com.webapp.save_money_backend.services;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.models.entities.User;
import com.webapp.save_money_backend.repositories.BillRepository;
import com.webapp.save_money_backend.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BillServiceImpl implements BillService {
    @Autowired
    private BillRepository billRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Bill> findAll() {
        return (List<Bill>) billRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Bill> findById(Long id) {
        return billRepository.findById(id);
    }

    @Override
    @Transactional
    public Bill save(Bill bill) {
        return billRepository.save(bill);
    }

    @Override
    public Optional<Bill> update(Bill bill, Long id) {
        Optional<Bill> findBill = this.findById(id);
        if (findBill.isPresent()) {
            Bill billDb = findBill.get();
            billDb.setBillDate(bill.getBillDate());
            billDb.setName(bill.getName());
            billDb.setAmount(bill.getAmount());
            billDb.setTotalDebt(bill.getTotalDebt());
            billDb.setActualDebt(bill.getActualDebt());
            billDb.setTotalBalance(bill.getTotalBalance());
            billDb.setRemainingAmount(bill.getRemainingAmount());
            billDb.setGap(bill.getGap());
            billDb.setChecked(bill.getChecked());
            return Optional.of(this.save(billDb));
        }
        return Optional.empty();
    }

    @Override
    public void remove(Long id) {
        billRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Bill> getBillsByUserId(Long id) {
        List<Bill> billsEntities = new ArrayList<>();
        try {
             billsEntities = billRepository.findByUserId(id);
        } catch (Error e) {
            throw new RuntimeException(String.format("Bill %s not found for user", id));
        }
       return billsEntities;
    }

    @Override
    @Transactional
    public Bill save(Bill bill, Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        Bill billEntity = new Bill();
        try {
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                bill.setUser(user);
                return billRepository.save(bill);
            }
        } catch (Error e) {
            throw new RuntimeException(String.format("Bill %s not found for user", id));
        }
       return billEntity;
    }
}
