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
import java.util.Calendar;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        List<Bill> bills;
        try {
            bills = billRepository.findByUserId(id);
        } catch (Error e) {
            throw new RuntimeException(String.format("Bill %s not found for user", id));
        }

        // Sort by position (nulls last), then by date
        bills.sort(Comparator.comparingInt((Bill b) -> b.getPosition() != null ? b.getPosition() : Integer.MAX_VALUE)
                .thenComparing(Bill::getBillDate));

        // Compute actualDebt and remainingAmount (cumulative per month/year)
        Map<String, Double> cumulativePerMonth = new HashMap<>();
        for (Bill bill : bills) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(bill.getBillDate());
            String key = cal.get(Calendar.YEAR) + "-" + (cal.get(Calendar.MONTH) + 1);

            double cumulative = cumulativePerMonth.getOrDefault(key, 0.0) + bill.getAmount();
            cumulativePerMonth.put(key, cumulative);

            bill.setActualDebt(bill.getTotalDebt() - bill.getAmount());
            bill.setRemainingAmount(bill.getTotalBalance() - cumulative);
        }

        return bills;
    }

    @Override
    @Transactional
    public void reorderBills(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Optional<Bill> billOpt = billRepository.findById(orderedIds.get(i));
            if (billOpt.isPresent()) {
                Bill bill = billOpt.get();
                bill.setPosition(i);
                billRepository.save(bill);
            }
        }
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
