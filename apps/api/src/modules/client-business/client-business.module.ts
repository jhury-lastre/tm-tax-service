import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientBusinessService } from './client-business.service';
import { ClientBusinessController } from './client-business.controller';
import { ClientBusiness } from '../../entities/client-business.entity';
import { BusinessFilingType } from '../../entities/business-filing-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientBusiness, BusinessFilingType])],
  controllers: [ClientBusinessController],
  providers: [ClientBusinessService],
  exports: [ClientBusinessService],
})
export class ClientBusinessModule {} 