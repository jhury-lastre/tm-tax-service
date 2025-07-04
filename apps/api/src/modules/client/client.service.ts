import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, MoreThan } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['incomes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Client | null> {
    const client = await this.clientRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['incomes'],
    });
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    
    await this.clientRepository.update(id, {
      ...updateClientDto,
      updatedAt: new Date(),
    });
    
    const updatedClient = await this.findOne(id);
    if (!updatedClient) {
      throw new NotFoundException('Client not found after update');
    }
    return updatedClient;
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    
    await this.clientRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: 'system', // You can replace this with actual user info
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async search(query: string): Promise<Client[]> {
    return await this.clientRepository.find({
      where: [
        { firstName: Like(`%${query}%`), deletedAt: IsNull() },
        { lastName: Like(`%${query}%`), deletedAt: IsNull() },
        { email: Like(`%${query}%`), deletedAt: IsNull() },
      ],
      relations: ['incomes'],
      order: { createdAt: 'DESC' },
    });
  }

  async getClientIncomes(clientId: string, year?: number): Promise<any[]> {
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.incomes', 'income')
      .where('client.id = :clientId', { clientId })
      .andWhere('client.deletedAt IS NULL')
      .andWhere('income.deletedAt IS NULL');

    if (year) {
      queryBuilder.andWhere('income.year = :year', { year });
    }

    const client = await queryBuilder.getOne();
    return client?.incomes || [];
  }

  async getStats(): Promise<any> {
    const totalClients = await this.clientRepository.count({
      where: { deletedAt: IsNull() },
    });

    const recentClients = await this.clientRepository.count({
      where: {
        deletedAt: IsNull(),
        createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      },
    });

    return {
      totalClients,
      recentClients,
    };
  }
} 