package com.webapp.save_money_backend.models.entities.dto.mapper;

import com.webapp.save_money_backend.models.entities.User;
import com.webapp.save_money_backend.models.entities.dto.UserDto;

public class DtoMapperUser {
    private User user;

    private DtoMapperUser() {
    }

    public static DtoMapperUser builder() {
        return new DtoMapperUser();
    }

    public DtoMapperUser setUser(User user) {
        this.user = user;
        return this;
    }

    public UserDto build() {
        if (user == null) {
            throw new RuntimeException("Should have user entity");
        }
        return new UserDto(this.user.getId(), user.getUsername(), user.getEmail());
    }
}
