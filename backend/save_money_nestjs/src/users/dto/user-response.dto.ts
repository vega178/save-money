import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'vega178' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  constructor(user: Partial<User>) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
  }
}
