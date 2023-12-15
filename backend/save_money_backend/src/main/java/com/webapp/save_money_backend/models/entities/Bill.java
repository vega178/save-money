package com.webapp.save_money_backend.models.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date billDate;
    private String name;
    private Long amount;
    private Long totalDebt;
    private Long actualDebt;
    private Long totalBalance;
    private Long remainingAmount;
    private Long gap;
}
