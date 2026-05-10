import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByUsername: jest.MockedFunction<UsersService['findByUsername']> };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = { findByUsername: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('mock.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser()', () => {
    it('should return user when credentials are valid', async () => {
      const hashed = await bcrypt.hash('correctpass', 10);
      usersService.findByUsername.mockResolvedValue({
        id: 1, username: 'vega178', password: hashed, roles: [],
      } as User);

      const result = await service.validateUser('vega178', 'correctpass');
      expect(result).not.toBeNull();
      expect(result?.username).toBe('vega178');
    });

    it('should return null when password is wrong', async () => {
      const hashed = await bcrypt.hash('realpass', 10);
      usersService.findByUsername.mockResolvedValue({
        id: 1, username: 'vega178', password: hashed, roles: [],
      } as User);

      const result = await service.validateUser('vega178', 'wrongpass');
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      const result = await service.validateUser('ghost', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login()', () => {
    it('should return a token and message', async () => {
      const user = {
        id: 1, username: 'vega178', password: 'hashed',
        roles: [{ name: 'ROLE_USER' }, { name: 'ROLE_ADMIN' }],
      } as User;

      const result = await service.login(user);
      expect(result.token).toBe('mock.jwt.token');
      expect(result.username).toBe('vega178');
      expect(result.message).toContain('vega178');
    });
  });
});
