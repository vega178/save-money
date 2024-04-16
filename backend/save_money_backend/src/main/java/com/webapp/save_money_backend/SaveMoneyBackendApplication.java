package com.webapp.save_money_backend;

import com.webapp.save_money_backend.models.entities.Bill;
import com.webapp.save_money_backend.services.BillService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SaveMoneyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaveMoneyBackendApplication.class, args);
	}

	CommandLineRunner lookupExistentService() {
		return args -> {
		};
	}

}
