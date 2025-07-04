import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ClientBusinessesSeeder } from './seeders/client-businesses.seeder';

async function seed2025BusinessesOnly() {
  console.log('🎯 Starting 2025 client businesses seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const clientBusinessesSeeder = app.get(ClientBusinessesSeeder);

    console.log('Seeding 2025 client businesses...');
    await clientBusinessesSeeder.seed2025Businesses();

    console.log('✅ 2025 businesses seeding completed successfully!');
  } catch (error) {
    console.error('❌ 2025 businesses seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  seed2025BusinessesOnly()
    .then(() => {
      console.log('🎉 2025 businesses seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 2025 businesses seeding process failed:', error);
      process.exit(1);
    });
} 