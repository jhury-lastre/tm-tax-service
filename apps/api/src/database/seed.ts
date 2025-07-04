import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IncomeTypesSeeder } from './seeders/income-types.seeder';
import { ClientsSeeder } from './seeders/clients.seeder';
import { ClientIncomeSeeder } from './seeders/client-income.seeder';
import { BusinessFilingTypesSeeder } from './seeders/business-filing-types.seeder';
import { ClientBusinessesSeeder } from './seeders/client-businesses.seeder';

async function runSeeders() {
  console.log('🌱 Starting manual database seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const incomeTypesSeeder = app.get(IncomeTypesSeeder);
    const clientsSeeder = app.get(ClientsSeeder);
    const clientIncomeSeeder = app.get(ClientIncomeSeeder);
    const businessFilingTypesSeeder = app.get(BusinessFilingTypesSeeder);
    const clientBusinessesSeeder = app.get(ClientBusinessesSeeder);

    console.log('1️⃣ Seeding income types...');
    await incomeTypesSeeder.seed();

    console.log('2️⃣ Seeding business filing types...');
    await businessFilingTypesSeeder.seed();

    console.log('3️⃣ Seeding clients...');
    await clientsSeeder.seed();

    console.log('4️⃣ Seeding client income data...');
    await clientIncomeSeeder.seed();

    console.log('5️⃣ Seeding client businesses...');
    await clientBusinessesSeeder.seed();

    console.log('6️⃣ Seeding additional 2025 client businesses...');
    await clientBusinessesSeeder.seed2025Businesses();

    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runSeeders()
    .then(() => {
      console.log('🎉 Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
} 