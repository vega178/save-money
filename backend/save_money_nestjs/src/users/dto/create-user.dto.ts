import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vega178', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'secret123', description: 'Password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'user@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;
}
