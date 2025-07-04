import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ClientBusiness, BenefitItem, EntityItem } from '../../entities/client-business.entity';
import { Client } from '../../entities/client.entity';
import { BusinessFilingType } from '../../entities/business-filing-type.entity';

@Injectable()
export class ClientBusinessesSeeder {
  constructor(
    @InjectRepository(ClientBusiness)
    private clientBusinessRepository: Repository<ClientBusiness>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(BusinessFilingType)
    private businessFilingTypeRepository: Repository<BusinessFilingType>,
  ) {}

  async seed(): Promise<ClientBusiness[]> {
    const existingCount = await this.clientBusinessRepository.count();
    
    // Only seed if we don't have client businesses already
    if (existingCount > 0) {
      console.log(`Client businesses already seeded (${existingCount} businesses exist)`);
      return await this.clientBusinessRepository.find();
    }

    // Get all clients and filing types
    const clients = await this.clientRepository.find();
    const filingTypes = await this.businessFilingTypeRepository.find();

    if (clients.length === 0) {
      console.log('No clients found. Please seed clients first.');
      return [];
    }

    if (filingTypes.length === 0) {
      console.log('No filing types found. Please seed filing types first.');
      return [];
    }

    const seededBusinesses: ClientBusiness[] = [];
    const numberOfBusinesses = 40; // Generate businesses for clients

    console.log(`Seeding ${numberOfBusinesses} client businesses...`);

    const industries = [
      'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Manufacturing',
      'Retail', 'Consulting', 'Marketing', 'Construction', 'Food & Beverage',
      'Education', 'Transportation', 'Legal Services', 'Agriculture', 'Entertainment'
    ];

    // Default benefits
    const defaultBenefits: BenefitItem[] = [
      { id: '401K', name: '401K', value: faker.datatype.boolean() },
      { id: 'life_insurance', name: 'Life Insurance', value: faker.datatype.boolean() },
      { id: 'health_insurance', name: 'Health Insurance', value: faker.datatype.boolean() },
      { id: 'sep_ira', name: 'SEP IRA', value: faker.datatype.boolean() },
    ];

    // Default entities
    const defaultEntities: EntityItem[] = [
      { id: 'articles_incorporation', name: 'Articles of Incorporation', value: faker.datatype.boolean() },
      { id: 'operating_agreement', name: 'Operating Agreement', value: faker.datatype.boolean() },
      { id: 'ein', name: 'EIN', value: faker.datatype.boolean() },
      { id: 'annual_board_meetings', name: 'Annual Board Meetings', value: faker.datatype.boolean() },
      { id: 'separate_bank_accounts', name: 'Separate Bank Accounts', value: faker.datatype.boolean() },
      { id: 'gl_insurance', name: 'GL Insurance', value: faker.datatype.boolean() },
      { id: 'business_asset', name: 'Business Asset', value: faker.datatype.boolean() },
    ];

    for (let i = 0; i < numberOfBusinesses; i++) {
      const randomClient = faker.helpers.arrayElement(clients);
      const randomFilingType = faker.helpers.arrayElement(filingTypes);
      const randomIndustry = faker.helpers.arrayElement(industries);

      const grossSales = faker.number.float({ min: 50000, max: 5000000, fractionDigits: 2 });
      const netSales = grossSales * faker.number.float({ min: 0.6, max: 0.9, fractionDigits: 2 });
      const projectedSales = grossSales * faker.number.float({ min: 1.1, max: 1.5, fractionDigits: 2 });

      const businessData = {
        clientId: randomClient.id,
        name: faker.company.name(),
        filingType: randomFilingType.name,
        ownership: faker.number.int({ min: 1, max: 100 }),
        employees: faker.number.int({ min: 1, max: 500 }),
        benefits: defaultBenefits.map(benefit => ({
          ...benefit,
          value: faker.datatype.boolean()
        })),
        grossSales,
        industry: randomIndustry,
        k1: faker.datatype.boolean() ? faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }) : null,
        netSales,
        projectedSales,
        w2: faker.datatype.boolean() ? faker.number.float({ min: 30000, max: 150000, fractionDigits: 2 }) : null,
        year: faker.number.int({ min: 2020, max: 2025 }),
        entities: defaultEntities.map(entity => ({
          ...entity,
          value: faker.datatype.boolean()
        })),
      };

      try {
        const newBusiness = this.clientBusinessRepository.create(businessData);
        const savedBusiness = await this.clientBusinessRepository.save(newBusiness);
        seededBusinesses.push(savedBusiness);
        
        if ((i + 1) % 10 === 0) {
          console.log(`Created ${i + 1}/${numberOfBusinesses} businesses...`);
        }
      } catch (error) {
        console.error(`Error creating business ${businessData.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`Successfully seeded ${seededBusinesses.length} client businesses`);
    return seededBusinesses;
  }

  async seed2025Businesses(): Promise<ClientBusiness[]> {
    console.log('🎯 Seeding additional 2025 client businesses...');

    // Get all clients and filing types
    const clients = await this.clientRepository.find();
    const filingTypes = await this.businessFilingTypeRepository.find();

    if (clients.length === 0) {
      console.log('No clients found. Please seed clients first.');
      return [];
    }

    if (filingTypes.length === 0) {
      console.log('No filing types found. Please seed filing types first.');
      return [];
    }

    const seededBusinesses: ClientBusiness[] = [];
    const numberOfBusinesses = 30; // Generate 30 additional 2025 businesses

    const industries = [
      'AI & Machine Learning', 'Renewable Energy', 'E-commerce', 'Digital Marketing',
      'Cybersecurity', 'Telehealth', 'Remote Work Solutions', 'Green Technology',
      'Blockchain', 'IoT Services', 'Cloud Computing', 'EdTech', 'FinTech',
      'Sustainable Agriculture', 'Social Media Management', 'Data Analytics'
    ];

    // Updated benefits for 2025
    const benefits2025: BenefitItem[] = [
      { id: '401K', name: '401K', value: faker.datatype.boolean() },
      { id: 'life_insurance', name: 'Life Insurance', value: faker.datatype.boolean() },
      { id: 'health_insurance', name: 'Health Insurance', value: faker.datatype.boolean() },
      { id: 'sep_ira', name: 'SEP IRA', value: faker.datatype.boolean() },
      { id: 'hsa', name: 'Health Savings Account', value: faker.datatype.boolean() },
      { id: 'remote_work_stipend', name: 'Remote Work Stipend', value: faker.datatype.boolean() },
    ];

    // Updated entities for 2025
    const entities2025: EntityItem[] = [
      { id: 'articles_incorporation', name: 'Articles of Incorporation', value: faker.datatype.boolean() },
      { id: 'operating_agreement', name: 'Operating Agreement', value: faker.datatype.boolean() },
      { id: 'ein', name: 'EIN', value: faker.datatype.boolean() },
      { id: 'annual_board_meetings', name: 'Annual Board Meetings', value: faker.datatype.boolean() },
      { id: 'separate_bank_accounts', name: 'Separate Bank Accounts', value: faker.datatype.boolean() },
      { id: 'gl_insurance', name: 'GL Insurance', value: faker.datatype.boolean() },
      { id: 'business_asset', name: 'Business Asset', value: faker.datatype.boolean() },
      { id: 'cyber_insurance', name: 'Cyber Insurance', value: faker.datatype.boolean() },
      { id: 'digital_contracts', name: 'Digital Contracts', value: faker.datatype.boolean() },
    ];

    for (let i = 0; i < numberOfBusinesses; i++) {
      const randomClient = faker.helpers.arrayElement(clients);
      const randomFilingType = faker.helpers.arrayElement(filingTypes);
      const randomIndustry = faker.helpers.arrayElement(industries);

      // Higher sales figures for 2025 to reflect growth/inflation
      const grossSales = faker.number.float({ min: 75000, max: 8000000, fractionDigits: 2 });
      const netSales = grossSales * faker.number.float({ min: 0.65, max: 0.92, fractionDigits: 2 });
      const projectedSales = grossSales * faker.number.float({ min: 1.15, max: 1.6, fractionDigits: 2 });

      const businessData = {
        clientId: randomClient.id,
        name: `${faker.company.name()} ${faker.helpers.arrayElement(['LLC', 'Corp', 'Inc', 'Solutions', 'Digital'])}`,
        filingType: randomFilingType.name,
        ownership: faker.number.int({ min: 1, max: 100 }),
        employees: faker.number.int({ min: 1, max: 750 }),
        benefits: benefits2025.map(benefit => ({
          ...benefit,
          value: faker.datatype.boolean()
        })),
        grossSales,
        industry: randomIndustry,
        k1: faker.datatype.boolean() ? faker.number.float({ min: 15000, max: 750000, fractionDigits: 2 }) : null,
        netSales,
        projectedSales,
        w2: faker.datatype.boolean() ? faker.number.float({ min: 35000, max: 200000, fractionDigits: 2 }) : null,
        year: 2025, // Specifically for 2025
        entities: entities2025.map(entity => ({
          ...entity,
          value: faker.datatype.boolean()
        })),
      };

      try {
        const newBusiness = this.clientBusinessRepository.create(businessData);
        const savedBusiness = await this.clientBusinessRepository.save(newBusiness);
        seededBusinesses.push(savedBusiness);
        
        if ((i + 1) % 10 === 0) {
          console.log(`Created ${i + 1}/${numberOfBusinesses} 2025 businesses...`);
        }
      } catch (error) {
        console.error(`Error creating 2025 business ${businessData.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`✅ Successfully seeded ${seededBusinesses.length} additional 2025 client businesses`);
    return seededBusinesses;
  }
}