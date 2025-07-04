import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ClientIncome } from '../../entities/client-income.entity';
import { Client } from '../../entities/client.entity';
import { ClientIncomeType } from '../../entities/client-income-type.entity';

@Injectable()
export class ClientIncomeSeeder {
  constructor(
    @InjectRepository(ClientIncome)
    private clientIncomeRepository: Repository<ClientIncome>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientIncomeType)
    private clientIncomeTypeRepository: Repository<ClientIncomeType>,
  ) {}

  async seed(): Promise<ClientIncome[]> {
    const existingCount = await this.clientIncomeRepository.count();
    
    // Only seed if we don't have income records already
    if (existingCount > 0) {
      console.log(`Client income already seeded (${existingCount} records exist)`);
      return await this.clientIncomeRepository.find();
    }

    // Get all clients and income types
    const clients = await this.clientRepository.find();
    const incomeTypes = await this.clientIncomeTypeRepository.find();

    if (clients.length === 0) {
      console.log('No clients found. Please seed clients first.');
      return [];
    }

    if (incomeTypes.length === 0) {
      console.log('No income types found. Please seed income types first.');
      return [];
    }

    const seededIncomes: ClientIncome[] = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear]; // Last 3 years

    console.log(`Seeding client income data for ${clients.length} clients across ${years.length} years...`);

    for (const client of clients) {
      for (const year of years) {
        // Randomly decide how many income types this client will have (1-6)
        const numberOfIncomeTypes = faker.number.int({ min: 1, max: 6 });
        const selectedIncomeTypes = faker.helpers.arrayElements(incomeTypes, numberOfIncomeTypes);

        for (const incomeType of selectedIncomeTypes) {
          const incomeData = this.generateIncomeByType(incomeType.name, client.id, year);
          
          try {
            const newIncome = this.clientIncomeRepository.create(incomeData);
            const savedIncome = await this.clientIncomeRepository.save(newIncome);
            seededIncomes.push(savedIncome);
          } catch (error) {
            console.error(`Error creating income for ${client.firstName} ${client.lastName}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }
      }
    }

    console.log(`Successfully seeded ${seededIncomes.length} income records`);
    return seededIncomes;
  }

  private generateIncomeByType(incomeType: string, clientId: string, year: number) {
    const baseData = {
      clientId,
      incomeType,
      year,
      isExtracted: faker.datatype.boolean({ probability: 0.7 }), // 70% chance of being extracted
      taxPayer: faker.person.fullName(),
      updatedBy: 'system',
    };

    switch (incomeType) {
      case 'w2':
        return {
          ...baseData,
          payer: faker.company.name(),
          amount: faker.number.float({ min: 30000, max: 150000, fractionDigits: 2 }),
        };

      case 'capital_gains':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['Fidelity', 'Charles Schwab', 'TD Ameritrade', 'E*Trade', 'Vanguard']),
          amount: faker.number.float({ min: 500, max: 25000, fractionDigits: 2 }),
        };

      case 'capital_gains_long_term':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['Fidelity', 'Charles Schwab', 'TD Ameritrade', 'E*Trade', 'Vanguard']),
          amount: faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
        };

      case 'dividends':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['Apple Inc.', 'Microsoft Corp.', 'Johnson & Johnson', 'Coca-Cola', 'Procter & Gamble']),
          amount: faker.number.float({ min: 100, max: 8000, fractionDigits: 2 }),
        };

      case 'interest':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One']),
          amount: faker.number.float({ min: 10, max: 2500, fractionDigits: 2 }),
        };

      case 'rental_income':
        return {
          ...baseData,
          payer: `${faker.location.streetAddress()}, ${faker.location.city()}`,
          amount: faker.number.float({ min: 12000, max: 60000, fractionDigits: 2 }),
        };

      case 'retirement':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['401(k) Plan', 'IRA Distribution', 'Pension Fund', 'TSP']),
          amount: faker.number.float({ min: 5000, max: 80000, fractionDigits: 2 }),
        };

      case 'social_security':
        return {
          ...baseData,
          payer: 'Social Security Administration',
          amount: faker.number.float({ min: 8000, max: 35000, fractionDigits: 2 }),
        };

      case 'patient':
        return {
          ...baseData,
          payer: faker.helpers.arrayElement(['Insurance Reimbursement', 'Patient Payment', 'Medicare', 'Medicaid']),
          amount: faker.number.float({ min: 500, max: 15000, fractionDigits: 2 }),
        };

      default:
        return {
          ...baseData,
          payer: faker.company.name(),
          amount: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
        };
    }
  }
} 