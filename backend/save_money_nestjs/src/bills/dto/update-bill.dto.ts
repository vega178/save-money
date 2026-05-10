import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBillDto {
  @ApiPropertyOptional({ example: '2024-01-30' })
  @IsDateString()
  @IsOptional()
  billDate?: string;

  @ApiPropertyOptional({ example: 'Servicios Publicos' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 276293 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 276293 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalDebt?: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  actualDebt?: number;

  @ApiPropertyOptional({ example: 5503591 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalBalance?: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  remainingAmount?: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  gap?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isChecked?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  position?: number;
}
