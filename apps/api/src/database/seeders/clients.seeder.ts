import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Client } from '../../entities/client.entity';

@Injectable()
export class ClientsSeeder {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async seed(): Promise<Client[]> {
    const existingCount = await this.clientRepository.count();
    
    // Only seed if we don't have clients already
    if (existingCount > 0) {
      console.log(`Clients already seeded (${existingCount} clients exist)`);
      return await this.clientRepository.find();
    }

    const seededClients: Client[] = [];
    const numberOfClients = 25; // Generate 25 sample clients

    console.log(`Seeding ${numberOfClients} clients...`);

    for (let i = 0; i < numberOfClients; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      
      const clientData = {
        firstName,
        lastName,
        email,
        phone: faker.phone.number({ style: 'national' }),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
        createdBy: 'system',
      };

      try {
        const newClient = this.clientRepository.create(clientData);
        const savedClient = await this.clientRepository.save(newClient);
        seededClients.push(savedClient);
        
        if ((i + 1) % 5 === 0) {
          console.log(`Created ${i + 1}/${numberOfClients} clients...`);
        }
      } catch (error) {
        console.error(`Error creating client ${firstName} ${lastName}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`Successfully seeded ${seededClients.length} clients`);
    return seededClients;
  }
} 