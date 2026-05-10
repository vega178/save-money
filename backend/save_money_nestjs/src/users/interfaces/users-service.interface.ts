import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';

/**
 * IUsersService
 *
 * Contract for the UsersService. Allows swapping the concrete implementation
 * without changing controllers or other consumers (Open/Closed Principle).
 */
export interface IUsersService {
  findAll(): Promise<UserResponseDto[]>;
  findById(id: number): Promise<UserResponseDto>;
  /** Internal — returns the raw entity including hashed password (used by AuthService). */
  findByUsername(username: string): Promise<User | null>;
  create(dto: CreateUserDto): Promise<UserResponseDto>;
  update(id: number, dto: UpdateUserDto): Promise<UserResponseDto>;
  remove(id: number): Promise<void>;
}

/** Injection token for IUsersService */
export const USERS_SERVICE = Symbol('IUsersService');
