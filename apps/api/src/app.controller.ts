import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Tax Management Calculator API',
      version: '1.0.0',
    };
  }

  @Get('info')
  getInfo() {
    return {
      name: 'Tax Management Calculator API',
      version: '1.0.0',
      description: 'API for managing client tax information and income data',
      endpoints: {
        clients: '/clients',
        clientIncome: '/client-income',
        health: '/health',
        info: '/info',
      },
      features: [
        'Client management',
        'Income tracking',
        'Tax calculations',
        'Income type management',
        'Statistical reporting',
      ],
    };
  }
}
