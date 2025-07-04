import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { ClientIncome } from '../../entities/client-income.entity';
import { ClientIncomeType } from '../../entities/client-income-type.entity';
import { CreateClientIncomeDto } from './dto/create-client-income.dto';
import { UpdateClientIncomeDto } from './dto/update-client-income.dto';

@Injectable()
export class ClientIncomeService {
  constructor(
    @InjectRepository(ClientIncome)
    private clientIncomeRepository: Repository<ClientIncome>,
    @InjectRepository(ClientIncomeType)
    private clientIncomeTypeRepository: Repository<ClientIncomeType>,
  ) {}

  async create(createClientIncomeDto: CreateClientIncomeDto): Promise<ClientIncome> {
    const clientIncome = this.clientIncomeRepository.create(createClientIncomeDto);
    return await this.clientIncomeRepository.save(clientIncome);
  }

  async findAll(
    page = 1, 
    limit = 10, 
    year?: number, 
    incomeType?: string
  ): Promise<{ data: ClientIncome[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.clientIncomeRepository
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.client', 'client')
      .leftJoinAndSelect('income.incomeTypeEntity', 'incomeType')
      .where('income.deletedAt IS NULL');

    if (year) {
      queryBuilder.andWhere('income.year = :year', { year });
    }

    if (incomeType) {
      queryBuilder.andWhere('income.incomeType = :incomeType', { incomeType });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('income.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<ClientIncome | null> {
    return await this.clientIncomeRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'incomeTypeEntity'],
    });
  }

  async findByClientId(clientId: string, year?: number): Promise<ClientIncome[]> {
    const queryBuilder = this.clientIncomeRepository
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.incomeTypeEntity', 'incomeType')
      .where('income.clientId = :clientId', { clientId })
      .andWhere('income.deletedAt IS NULL');

    if (year) {
      queryBuilder.andWhere('income.year = :year', { year });
    }

    return await queryBuilder
      .orderBy('income.createdAt', 'DESC')
      .getMany();
  }

  async update(id: number, updateClientIncomeDto: UpdateClientIncomeDto): Promise<ClientIncome> {
    const income = await this.findOne(id);
    if (!income) {
      throw new NotFoundException('Client income not found');
    }

    await this.clientIncomeRepository.update(id, {
      ...updateClientIncomeDto,
      updatedAt: new Date(),
    });
    
    const updatedIncome = await this.findOne(id);
    if (!updatedIncome) {
      throw new NotFoundException('Client income not found after update');
    }
    return updatedIncome;
  }

  async remove(id: number): Promise<void> {
    const income = await this.findOne(id);
    if (!income) {
      throw new NotFoundException('Client income not found');
    }

    await this.clientIncomeRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: 'system',
    });
  }

  async findIncomeTypes(): Promise<ClientIncomeType[]> {
    return await this.clientIncomeTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getTotalIncomeByClientAndYear(clientId: string, year: number): Promise<number> {
    const result = await this.clientIncomeRepository
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where('income.clientId = :clientId', { clientId })
      .andWhere('income.year = :year', { year })
      .andWhere('income.deletedAt IS NULL')
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getIncomeByTypeAndClient(clientId: string, incomeType: string, year?: number): Promise<ClientIncome[]> {
    const queryBuilder = this.clientIncomeRepository
      .createQueryBuilder('income')
      .where('income.clientId = :clientId', { clientId })
      .andWhere('income.incomeType = :incomeType', { incomeType })
      .andWhere('income.deletedAt IS NULL');

    if (year) {
      queryBuilder.andWhere('income.year = :year', { year });
    }

    return await queryBuilder.getMany();
  }

  async getIncomeStats(year?: number): Promise<any> {
    const queryBuilder = this.clientIncomeRepository
      .createQueryBuilder('income')
      .select([
        'income.incomeType as incomeType',
        'COUNT(income.id) as count',
        'SUM(income.amount) as totalAmount',
        'AVG(income.amount) as averageAmount'
      ])
      .where('income.deletedAt IS NULL');

    if (year) {
      queryBuilder.andWhere('income.year = :year', { year });
    }

    const stats = await queryBuilder
      .groupBy('income.incomeType')
      .getRawMany();

    const totalRecords = await this.clientIncomeRepository.count({
      where: year ? { deletedAt: IsNull(), year } : { deletedAt: IsNull() },
    });

    const totalAmount = await this.clientIncomeRepository
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where('income.deletedAt IS NULL')
      .andWhere(year ? 'income.year = :year' : '1=1', year ? { year } : {})
      .getRawOne();

    return {
      byType: stats.map(stat => ({
        incomeType: stat.incomeType,
        count: Number(stat.count),
        totalAmount: Number(stat.totalAmount) || 0,
        averageAmount: Number(stat.averageAmount) || 0,
      })),
      overall: {
        totalRecords,
        totalAmount: Number(totalAmount?.total) || 0,
        year: year || 'all',
      }
    };
  }
} 