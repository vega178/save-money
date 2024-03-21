package com.webapp.save_money_backend.controllers;

import com.webapp.save_money_backend.models.entities.User;
import com.webapp.save_money_backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping()
    public List<User> listAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> find(@PathVariable Long id){
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestBody User user, @PathVariable Long id) {
        Optional<User> userToUpdate = userService.update(user, id);
        if (userToUpdate.isPresent()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(userToUpdate.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable Long id) {
        Optional<User> userToRemove = userService.findById(id);
        if (userToRemove.isPresent()) {
            userService.remove(id);
            return ResponseEntity.noContent().build(); //204
        }
        return ResponseEntity.notFound().build();
    }
}
