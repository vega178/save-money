package com.webapp.save_money_backend.services;

import com.webapp.save_money_backend.models.entities.Role;
import com.webapp.save_money_backend.models.entities.User;
import com.webapp.save_money_backend.models.entities.dto.UserDto;
import com.webapp.save_money_backend.models.entities.dto.mapper.DtoMapperUser;
import com.webapp.save_money_backend.repositories.RoleRepository;
import com.webapp.save_money_backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        List<User> users = (List<User>) userRepository.findAll();
        return users.stream()
                .map(userData -> DtoMapperUser.builder().setUser(userData).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> findById(Long id) {
        return userRepository.findById(id).map(user -> DtoMapperUser.builder().setUser(user).build());
    }

    @Override
    @Transactional
    public UserDto save(User user) {
        // Encriptar el password que viene del front o de postman
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Optional<Role> optionalRole = roleRepository.findByName("ROLE_USER");
        List<Role> roles = new ArrayList<>();
        if (optionalRole.isPresent()) {
            roles.add(optionalRole.orElseThrow());
        }
        user.setRoles(roles);

        return DtoMapperUser.builder().setUser(userRepository.save(user)).build();
    }

    @Override
    @Transactional
    public Optional<UserDto> update(User user, Long id) {
        Optional<User> findUser = userRepository.findById(id);
        User userOptional = null;
        if (findUser.isPresent()) {
            User userDb = findUser.orElseThrow();
            userDb.setUsername(user.getUsername());
            userDb.setEmail(user.getEmail());
            userOptional = userRepository.save(userDb);
        }
        return Optional.ofNullable(DtoMapperUser.builder().setUser(userOptional).build());
    }

    @Override
    @Transactional
    public void remove(Long id) {
        userRepository.deleteById(id);
    }
}
