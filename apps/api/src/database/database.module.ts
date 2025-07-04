import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { ClientIncome } from '../entities/client-income.entity';
import { ClientIncomeType } from '../entities/client-income-type.entity';
import { ClientBusiness } from '../entities/client-business.entity';
import { BusinessFilingType } from '../entities/business-filing-type.entity';
import { IncomeTypesSeeder } from './seeders/income-types.seeder';
import { ClientsSeeder } from './seeders/clients.seeder';
import { ClientIncomeSeeder } from './seeders/client-income.seeder';
import { BusinessFilingTypesSeeder } from './seeders/business-filing-types.seeder';
import { ClientBusinessesSeeder } from './seeders/client-businesses.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientIncome, ClientIncomeType, ClientBusiness, BusinessFilingType])],
  providers: [IncomeTypesSeeder, ClientsSeeder, ClientIncomeSeeder, BusinessFilingTypesSeeder, ClientBusinessesSeeder],
  exports: [IncomeTypesSeeder, ClientsSeeder, ClientIncomeSeeder, BusinessFilingTypesSeeder, ClientBusinessesSeeder],
})
export class DatabaseModule {} 