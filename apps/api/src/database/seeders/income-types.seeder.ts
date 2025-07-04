import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientIncomeType } from '../../entities/client-income-type.entity';

@Injectable()
export class IncomeTypesSeeder {
  constructor(
    @InjectRepository(ClientIncomeType)
    private incomeTypeRepository: Repository<ClientIncomeType>,
  ) {}

  async seed(): Promise<void> {
    const incomeTypes = [
      { name: 'capital_gains', description: 'Capital Gains' },
      { name: 'capital_gains_long_term', description: 'Capital Gains (Long Term)' },
      { name: 'dividends', description: 'Dividends' },
      { name: 'interest', description: 'Interest' },
      { name: 'patient', description: 'Patient' },
      { name: 'rental_income', description: 'Rental Income' },
      { name: 'retirement', description: 'Retirement' },
      { name: 'social_security', description: 'Social Security' },
      { name: 'w2', description: 'W2' },
    ];

    for (const incomeType of incomeTypes) {
      const existingType = await this.incomeTypeRepository.findOne({
        where: { name: incomeType.name },
      });

      if (!existingType) {
        const newIncomeType = this.incomeTypeRepository.create(incomeType);
        await this.incomeTypeRepository.save(newIncomeType);
        console.log(`Created income type: ${incomeType.name}`);
      } else {
        console.log(`Income type already exists: ${incomeType.name}`);
      }
    }
  }
} 