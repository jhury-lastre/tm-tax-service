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
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    try {
      return await this.clientService.create(createClientDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      return await this.clientService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    try {
      if (!query) {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }
      return await this.clientService.search(query);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const client = await this.clientService.findOne(id);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      return client;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/incomes')
  async getClientIncomes(@Param('id', ParseUUIDPipe) id: string, @Query('year') year?: number) {
    try {
      const client = await this.clientService.findOne(id);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      return await this.clientService.getClientIncomes(id, year);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve client incomes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    try {
      const client = await this.clientService.update(id, updateClientDto);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      return client;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.clientService.remove(id);
      return { message: 'Client deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    try {
      const client = await this.clientService.findByEmail(email);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      return client;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 