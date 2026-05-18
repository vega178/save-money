import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBirthdayDto {
  @ApiPropertyOptional({ example: 'Alice Johnson' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: '1990-05-13' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Loves chocolate cake' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
