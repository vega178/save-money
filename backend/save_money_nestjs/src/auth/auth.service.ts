import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// Mirrors the logic inside JwtAuthenticationFilter.successfulAuthentication()
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Called by LocalStrategy.validate() — equivalent to authenticationManager.authenticate()
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  // Builds and signs the JWT — mirrors successfulAuthentication() token construction
  async login(user: User) {
    const roles = user.roles?.map((r) => r.name) ?? [];
    const isAdmin = roles.includes('ROLE_ADMIN');

    const payload: JwtPayload = {
      sub: user.username,
      isAdmin,
      authorities: roles,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      message: `Hey ${user.username} you just signed in successfully`,
      username: user.username,
    };
  }
}
