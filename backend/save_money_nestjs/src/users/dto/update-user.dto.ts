import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new_username', description: 'Updated username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'new@example.com', description: 'Updated email address' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
