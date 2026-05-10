import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { IUsersService } from './interfaces/users-service.interface';

// Mirrors UserServiceImpl.java
@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Mirrors UserServiceImpl.findAll()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({ relations: ['roles'] });
    return users.map((user) => new UserResponseDto(user));
  }

  // Mirrors UserServiceImpl.findById()
  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserResponseDto(user);
  }

  // Used internally by AuthService — returns hashed password too
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  // Mirrors UserServiceImpl.save() — hashes password, assigns ROLE_USER automatically
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Auto-assign ROLE_USER — mirrors UserServiceImpl default role logic
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'ROLE_USER' },
    });

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      roles: defaultRole ? [defaultRole] : [],
    });

    const saved = await this.userRepository.save(user);
    return new UserResponseDto(saved);
  }

  // Mirrors UserServiceImpl.update() — only username and email are updated
  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;

    const saved = await this.userRepository.save(user);
    return new UserResponseDto(saved);
  }

  // Mirrors UserServiceImpl.remove()
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
  }
}
