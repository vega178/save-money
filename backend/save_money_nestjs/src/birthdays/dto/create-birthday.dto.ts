import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBirthdayDto {
  @ApiProperty({ example: 'Alice Johnson', description: 'Full name of the person' })
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: '1990-05-13', description: 'Birth date (YYYY-MM-DD)' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'Loves chocolate cake', description: 'Optional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photo.jpg', description: 'Photo URL' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
