import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/user.entity';
import { StoreLevel1Address } from '../level1-addresses/dtos/create-level1-address.dto';
import { StoreLevel4AddressDTO } from './dtos/store-level4-address.dto';
import { UpdateLevel4AddressDTO } from './dtos/update-level4-address.dto';
import { Level4AddressesService } from './level4-addresses.service';
@ApiTags('Level4 Addresses')
@Controller('level4-addresses')
export class Level4AddressesController {
    constructor(private level4AddressesService: Level4AddressesService) {}

    @Get()
    @UseGuards(new IsEmployeeGuard())
    async getAll(@CurrentUser() user) {
      return await this.level4AddressesService.findAll(user.id, ['parent']);
    }
  
    @Post()
    @UsePipes(new ValidationPipe())
    @UseGuards(new IsEmployeeGuard())
    async store(@Body() data: StoreLevel4AddressDTO, @CurrentUser() user: User) {
      return await this.level4AddressesService.store(data, user.company_id);
    }

    
  @Put(':id')
  @UseGuards(new IsEmployeeGuard())
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateLevel4AddressDTO,
  ) {
    return await this.level4AddressesService.update(id, data, user.id);
  }

  @Get(':id')
  @UseGuards(new IsEmployeeGuard())
  async getOneById(@CurrentUser() user, @Param('id') id: string) {
    return await this.level4AddressesService.findByIdOrFail(id);
  }

  @Delete(':id')
  @UseGuards(new IsEmployeeGuard())
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return await this.level4AddressesService.delete(id, user.id);
  }

  
  @Get(':id/children')
  @UseGuards(new IsEmployeeGuard())
  async getChildren(@CurrentUser() user, @Param('id') id: string) {
    return await this.level4AddressesService.findChildren(id);
  }

}