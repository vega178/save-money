import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';
import { Role } from '../../../src/users/entities/role.entity';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockUserRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockRoleRepository = () => ({
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleRepo: jest.Mocked<Repository<Role>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Role), useFactory: mockRoleRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
  });

  describe('findAll()', () => {
    it('should return an array of UserResponseDtos', async () => {
      userRepo.find.mockResolvedValue([
        { id: 1, username: 'vega178', email: 'test@test.com', password: 'hashed', roles: [] },
      ] as User[]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('vega178');
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('findById()', () => {
    it('should return a UserResponseDto when user exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1, username: 'vega178', email: 'test@test.com', password: 'hashed', roles: [],
      } as User);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('should hash the password and assign ROLE_USER', async () => {
      userRepo.findOne.mockResolvedValue(null); // no conflict
      roleRepo.findOne.mockResolvedValue({ id: 2, name: 'ROLE_USER' } as Role);
      userRepo.create.mockReturnValue({ id: 1, username: 'newuser', email: 'new@test.com', roles: [] } as any);
      userRepo.save.mockResolvedValue({ id: 1, username: 'newuser', email: 'new@test.com', password: 'hashed', roles: [{ name: 'ROLE_USER' }] } as User);

      const result = await service.create({ username: 'newuser', email: 'new@test.com', password: 'secret123' });
      expect(result.username).toBe('newuser');
      expect((result as any).password).toBeUndefined();
    });

    it('should throw ConflictException when username/email already exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      await expect(
        service.create({ username: 'vega178', email: 'taken@test.com', password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove()', () => {
    it('should remove the user', async () => {
      const user = { id: 1, username: 'vega178' } as User;
      userRepo.findOne.mockResolvedValue(user);
      userRepo.remove.mockResolvedValue(user);
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
