import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { ClientBusiness } from '../../entities/client-business.entity';
import { CreateClientBusinessDto } from './dto/create-client-business.dto';
import { UpdateClientBusinessDto } from './dto/update-client-business.dto';
import { QueryClientBusinessDto } from './dto/query-client-business.dto';

@Injectable()
export class ClientBusinessService {
  constructor(
    @InjectRepository(ClientBusiness)
    private clientBusinessRepository: Repository<ClientBusiness>,
  ) {}

  async create(createClientBusinessDto: CreateClientBusinessDto): Promise<ClientBusiness> {
    try {
      const clientBusiness = this.clientBusinessRepository.create(createClientBusinessDto);
      return await this.clientBusinessRepository.save(clientBusiness);
    } catch (error) {
      throw new BadRequestException('Failed to create client business', error instanceof Error ? error.message : String(error));
    }
  }

  async findAll(queryDto: QueryClientBusinessDto): Promise<{ data: ClientBusiness[]; total: number; page: number; limit: number }> {
    const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'DESC', search, clientId, filingType, industry, year } = queryDto;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    const queryBuilder = this.clientBusinessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.client', 'client')
      .leftJoinAndSelect('business.businessFilingType', 'filingType')
      .where('business.deletedAt IS NULL');

    // Apply filters
    if (clientId) {
      queryBuilder.andWhere('business.clientId = :clientId', { clientId });
    }

    if (filingType) {
      queryBuilder.andWhere('business.filingType = :filingType', { filingType });
    }

    if (industry) {
      queryBuilder.andWhere('business.industry ILIKE :industry', { industry: `%${industry}%` });
    }

    if (year) {
      queryBuilder.andWhere('business.year = :year', { year });
    }

    if (search) {
      queryBuilder.andWhere(
        '(business.name ILIKE :search OR business.industry ILIKE :search OR client.firstName ILIKE :search OR client.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    if (sortBy === 'clientName') {
      queryBuilder.orderBy('client.firstName', sortOrder as 'ASC' | 'DESC');
    } else if (sortBy === 'filingType') {
      queryBuilder.orderBy('business.filingType', sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`business.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(offset)
      .take(limitNumber)
      .getManyAndCount();

    return {
      data,
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  }

  async findOne(id: string): Promise<ClientBusiness> {
    const clientBusiness = await this.clientBusinessRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'businessFilingType'],
    });

    if (!clientBusiness) {
      throw new NotFoundException(`Client business with ID ${id} not found`);
    }

    return clientBusiness;
  }

  async findByClientId(clientId: string): Promise<ClientBusiness[]> {
    return await this.clientBusinessRepository.find({
      where: { clientId, deletedAt: IsNull() },
      relations: ['businessFilingType'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateClientBusinessDto: UpdateClientBusinessDto): Promise<ClientBusiness> {
    const clientBusiness = await this.findOne(id);

    try {
      Object.assign(clientBusiness, updateClientBusinessDto);
      clientBusiness.updatedAt = new Date();
      return await this.clientBusinessRepository.save(clientBusiness);
    } catch (error) {
      throw new BadRequestException('Failed to update client business', error instanceof Error ? error.message : String(error));
    }
  }

  async remove(id: string, deletedBy?: string): Promise<void> {
    const clientBusiness = await this.findOne(id);

    try {
      clientBusiness.deletedAt = new Date();
      if (deletedBy) {
        clientBusiness.deletedBy = deletedBy;
      }
      await this.clientBusinessRepository.save(clientBusiness);
    } catch (error) {
      throw new BadRequestException('Failed to delete client business', error instanceof Error ? error.message : String(error));
    }
  }

  async getBusinessStats(clientId?: string): Promise<{
    totalBusinesses: number;
    businessesByType: Record<string, number>;
    businessesByYear: Record<string, number>;
    totalRevenue: number;
    averageEmployees: number;
  }> {
    const queryBuilder = this.clientBusinessRepository
      .createQueryBuilder('business')
      .where('business.deletedAt IS NULL');

    if (clientId) {
      queryBuilder.andWhere('business.clientId = :clientId', { clientId });
    }

    const businesses = await queryBuilder.getMany();

    const totalBusinesses = businesses.length;
    const businessesByType = businesses.reduce((acc, business) => {
      const type = business.filingType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const businessesByYear = businesses.reduce((acc, business) => {
      const year = business.year?.toString() || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = businesses.reduce((sum, business) => sum + (business.grossSales || 0), 0);
    const totalEmployees = businesses.reduce((sum, business) => sum + (business.employees || 0), 0);
    const averageEmployees = totalBusinesses > 0 ? totalEmployees / totalBusinesses : 0;

    return {
      totalBusinesses,
      businessesByType,
      businessesByYear,
      totalRevenue,
      averageEmployees,
    };
  }
} 