import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpException, 
  HttpStatus,
  Query,
  ParseIntPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import { ClientIncomeService } from './client-income.service';
import { CreateClientIncomeDto } from './dto/create-client-income.dto';
import { UpdateClientIncomeDto } from './dto/update-client-income.dto';

@Controller('client-income')
export class ClientIncomeController {
  constructor(private readonly clientIncomeService: ClientIncomeService) {}

  @Post()
  async create(@Body() createClientIncomeDto: CreateClientIncomeDto) {
    try {
      return await this.clientIncomeService.create(createClientIncomeDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create client income',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10,
    @Query('year') year?: number,
    @Query('incomeType') incomeType?: string
  ) {
    try {
      return await this.clientIncomeService.findAll(page, limit, year, incomeType);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve client incomes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('types')
  async getIncomeTypes() {
    try {
      return await this.clientIncomeService.findIncomeTypes();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve income types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getStats(@Query('year') year?: number) {
    try {
      return await this.clientIncomeService.getIncomeStats(year);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve income statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const clientIncome = await this.clientIncomeService.findOne(id);
      if (!clientIncome) {
        throw new HttpException('Client income not found', HttpStatus.NOT_FOUND);
      }
      return clientIncome;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve client income',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('client/:clientId')
  async findByClientId(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query('year') year?: number
  ) {
    try {
      return await this.clientIncomeService.findByClientId(clientId, year);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve client incomes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('client/:clientId/total')
  async getTotalIncomeByClient(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query('year', ParseIntPipe) year: number
  ) {
    try {
      const total = await this.clientIncomeService.getTotalIncomeByClientAndYear(clientId, year);
      return { clientId, year, totalIncome: total };
    } catch (error) {
      throw new HttpException(
        'Failed to calculate total income',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateClientIncomeDto: UpdateClientIncomeDto) {
    try {
      const clientIncome = await this.clientIncomeService.update(id, updateClientIncomeDto);
      if (!clientIncome) {
        throw new HttpException('Client income not found', HttpStatus.NOT_FOUND);
      }
      return clientIncome;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update client income',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.clientIncomeService.remove(id);
      return { message: 'Client income deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete client income',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 