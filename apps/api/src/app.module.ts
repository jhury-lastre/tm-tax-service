import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './modules/client/client.module';
import { ClientIncomeModule } from './modules/client-income/client-income.module';
import { ClientBusinessModule } from './modules/client-business/client-business.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
      logging: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    DatabaseModule,
    ClientModule,
    ClientIncomeModule,
    ClientBusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
