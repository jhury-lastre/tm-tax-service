import { Injectable, OnModuleInit } from '@nestjs/common';
import { IncomeTypesSeeder } from './database/seeders/income-types.seeder';
import { ClientsSeeder } from './database/seeders/clients.seeder';
import { ClientIncomeSeeder } from './database/seeders/client-income.seeder';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly incomeTypesSeeder: IncomeTypesSeeder,
    private readonly clientsSeeder: ClientsSeeder,
    private readonly clientIncomeSeeder: ClientIncomeSeeder,
  ) {}

  async onModuleInit(): Promise<void> {
    // Run seeders on application startup
    await this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🌱 Initializing database with seed data...');
      
      // 1. Seed income types first (they're referenced by client income)
      await this.incomeTypesSeeder.seed();
      
      // 2. Seed clients (they're referenced by client income)
      await this.clientsSeeder.seed();
      
      // 3. Seed client income data (depends on both clients and income types)
      await this.clientIncomeSeeder.seed();
      
      console.log('✅ Database initialization completed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  getHello(): string {
    return 'Hello World! Tax Management Calculator API is running.';
  }
}
