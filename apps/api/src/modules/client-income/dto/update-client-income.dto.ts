import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreateClientIncomeDto } from './create-client-income.dto';

export class UpdateClientIncomeDto extends PartialType(CreateClientIncomeDto) {
  @IsString()
  @IsOptional()
  updatedBy?: string;
} 