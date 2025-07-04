import { PartialType } from '@nestjs/mapped-types';
import { CreateClientBusinessDto } from './create-client-business.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateClientBusinessDto extends PartialType(CreateClientBusinessDto) {
  @IsUUID()
  @IsOptional()
  updatedBy?: string;
} 