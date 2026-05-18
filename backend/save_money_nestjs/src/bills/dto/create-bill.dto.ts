import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiPropertyOptional({ example: '2024-01-30', description: 'Bill date (ISO string)' })
  @IsDateString()
  @IsOptional()
  billDate?: string;

  @ApiProperty({ example: 'Servicios Publicos', description: 'Bill name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 276293, description: 'Monthly payment amount' })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 276293, description: 'Total debt for this bill' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalDebt?: number;

  @ApiPropertyOptional({ example: 0, description: 'Current actual debt (computed)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  actualDebt?: number;

  @ApiPropertyOptional({ example: 5503591, description: 'Total balance available' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalBalance?: number;

  @ApiPropertyOptional({ example: 0, description: 'Remaining amount after deductions (computed)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  remainingAmount?: number;

  @ApiPropertyOptional({ example: false, description: 'Whether the bill has been checked/paid' })
  @IsBoolean()
  @IsOptional()
  isChecked?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Position for drag-and-drop ordering' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  position?: number;
}
