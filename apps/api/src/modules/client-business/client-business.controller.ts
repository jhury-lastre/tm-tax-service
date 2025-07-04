import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientBusinessService } from './client-business.service';
import { CreateClientBusinessDto } from './dto/create-client-business.dto';
import { UpdateClientBusinessDto } from './dto/update-client-business.dto';
import { QueryClientBusinessDto } from './dto/query-client-business.dto';

@Controller('client-businesses')
export class ClientBusinessController {
  constructor(private readonly clientBusinessService: ClientBusinessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientBusinessDto: CreateClientBusinessDto) {
    return {
      success: true,
      message: 'Client business created successfully',
      data: await this.clientBusinessService.create(createClientBusinessDto),
    };
  }

  @Get()
  async findAll(@Query() queryDto: QueryClientBusinessDto) {
    const result = await this.clientBusinessService.findAll(queryDto);
    return {
      success: true,
      message: 'Client businesses retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('stats')
  async getBusinessStats(@Query('clientId') clientId?: string) {
    return {
      success: true,
      message: 'Business statistics retrieved successfully',
      data: await this.clientBusinessService.getBusinessStats(clientId),
    };
  }

  @Get('client/:clientId')
  async findByClientId(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return {
      success: true,
      message: 'Client businesses retrieved successfully',
      data: await this.clientBusinessService.findByClientId(clientId),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Client business retrieved successfully',
      data: await this.clientBusinessService.findOne(id),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientBusinessDto: UpdateClientBusinessDto) {
    return {
      success: true,
      message: 'Client business updated successfully',
      data: await this.clientBusinessService.update(id, updateClientBusinessDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Body('deletedBy') deletedBy?: string) {
    await this.clientBusinessService.remove(id, deletedBy);
    return {
      success: true,
      message: 'Client business deleted successfully',
    };
  }

  @Get('search/by-name')
  async searchByName(@Query('name') name: string) {
    const queryDto: QueryClientBusinessDto = { name };
    const result = await this.clientBusinessService.findAll(queryDto);
    return {
      success: true,
      message: 'Search results retrieved successfully',
      data: result.data,
    };
  }

  @Get('filter/by-filing-type/:filingType')
  async findByFilingType(@Param('filingType') filingType: string) {
    const queryDto: QueryClientBusinessDto = { filingType };
    const result = await this.clientBusinessService.findAll(queryDto);
    return {
      success: true,
      message: 'Businesses by filing type retrieved successfully',
      data: result.data,
    };
  }

  @Get('filter/by-industry/:industry')
  async findByIndustry(@Param('industry') industry: string) {
    const queryDto: QueryClientBusinessDto = { industry };
    const result = await this.clientBusinessService.findAll(queryDto);
    return {
      success: true,
      message: 'Businesses by industry retrieved successfully',
      data: result.data,
    };
  }

  @Get('filter/by-year/:year')
  async findByYear(@Param('year') year: string) {
    const queryDto: QueryClientBusinessDto = { year: parseInt(year, 10) };
    const result = await this.clientBusinessService.findAll(queryDto);
    return {
      success: true,
      message: 'Businesses by year retrieved successfully',
      data: result.data,
    };
  }
} 