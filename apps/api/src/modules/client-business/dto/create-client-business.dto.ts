import { IsString, IsNumber, IsArray, IsOptional, IsUUID, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BenefitItem, EntityItem } from '../../../entities/client-business.entity';

export class CreateClientBusinessDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  filingType?: string;

  @IsNumber()
  @IsOptional()
  ownership?: number;

  @IsNumber()
  @IsOptional()
  employees?: number;

  @IsArray()
  @IsOptional()
  benefits?: BenefitItem[];

  @IsNumber()
  @IsOptional()
  grossSales?: number;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsNumber()
  @IsOptional()
  k1?: number;

  @IsNumber()
  @IsOptional()
  netSales?: number;

  @IsNumber()
  @IsOptional()
  projectedSales?: number;

  @IsNumber()
  @IsOptional()
  w2?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsArray()
  @IsOptional()
  entities?: EntityItem[];

  @IsUUID()
  @IsOptional()
  updatedBy?: string;
} 