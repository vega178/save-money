package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Long> {

}
