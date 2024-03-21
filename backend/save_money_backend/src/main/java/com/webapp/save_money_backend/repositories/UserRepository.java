package com.webapp.save_money_backend.repositories;

import com.webapp.save_money_backend.models.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserRepository extends CrudRepository<User, Long> {
    @Override
    Optional<User> findById(Long id);

    //Consulta a la clase entities (?1: se refiere a consultar el valor del parametro username)
    //@Query("select u from User u where u.username=?1") //esto cuando no se escribe el metodo con el verbo por getUserByUserName
    Optional<User> findByUsername(String username);
}
