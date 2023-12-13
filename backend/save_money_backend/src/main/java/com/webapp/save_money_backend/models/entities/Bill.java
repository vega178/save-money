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
    @Getter
    @Setter
    private Long id;
    @Getter
    @Setter
    private Date billDate;
    @Getter
    @Setter
    private String name;
    @Getter
    @Setter
    private Long amount;
    @Getter
    @Setter
    private Long totalDebt;
    @Getter
    @Setter
    private Long actualDebt;
    @Getter
    @Setter
    private Long totalBalance;
    @Getter
    @Setter
    private Long remainingAmount;
    @Getter
    @Setter
    private Long gap;
}
