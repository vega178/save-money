package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserRepository extends CrudRepository<User, Long> {
    @Override
    Optional<User> findById(Long id);
}
