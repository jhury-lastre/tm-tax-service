import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientIncome } from '../../entities/client-income.entity';
import { ClientIncomeType } from '../../entities/client-income-type.entity';
import { ClientIncomeService } from './client-income.service';
import { ClientIncomeController } from './client-income.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientIncome, ClientIncomeType])],
  controllers: [ClientIncomeController],
  providers: [ClientIncomeService],
  exports: [ClientIncomeService],
})
export class ClientIncomeModule {} 