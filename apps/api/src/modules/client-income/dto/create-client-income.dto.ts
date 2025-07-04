import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateClientIncomeDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @IsOptional()
  taxPayer?: string;

  @IsString()
  @IsOptional()
  payer?: string;

  @IsString()
  @IsOptional()
  incomeType?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsBoolean()
  @IsOptional()
  isExtracted?: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
} 