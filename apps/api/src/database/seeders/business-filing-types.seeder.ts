import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessFilingType } from '../../entities/business-filing-type.entity';

@Injectable()
export class BusinessFilingTypesSeeder {
  constructor(
    @InjectRepository(BusinessFilingType)
    private businessFilingTypeRepository: Repository<BusinessFilingType>,
  ) {}

  async seed(): Promise<BusinessFilingType[]> {
    const existingCount = await this.businessFilingTypeRepository.count();
    
    // Only seed if we don't have filing types already
    if (existingCount > 0) {
      console.log(`Business filing types already seeded (${existingCount} types exist)`);
      return await this.businessFilingTypeRepository.find();
    }

    const filingTypes = [
      {
        name: 'c_corp',
        description: 'C Corp',
      },
      {
        name: 'llc',
        description: 'LLC',
      },
      {
        name: 'partnership',
        description: 'Partnership',
      },
      {
        name: 'schedule_c',
        description: 'Schedule C',
      },
      {
        name: 's_corp',
        description: 'S Corp',
      },
      {
        name: 'sole_proprietorships',
        description: 'Sole Proprietorship',
      },
    ];

    const seededTypes: BusinessFilingType[] = [];

    console.log(`Seeding ${filingTypes.length} business filing types...`);

    for (const filingTypeData of filingTypes) {
      try {
        const newType = this.businessFilingTypeRepository.create(filingTypeData);
        const savedType = await this.businessFilingTypeRepository.save(newType);
        seededTypes.push(savedType);
        console.log(`Created filing type: ${savedType.name} (${savedType.description})`);
      } catch (error) {
        console.error(`Error creating filing type ${filingTypeData.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`Successfully seeded ${seededTypes.length} business filing types`);
    return seededTypes;
  }
} 