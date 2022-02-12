import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/user.entity';
import { StoreLevel3Address } from '../level3-addresses/dtos/store-level3-address.dto';
import { StoreLevel2Address } from './dtos/store-level2-address.dto';
import { UpdateLevel2AddressDTO } from './dtos/update-level2-address.dto';
import { Level2AddressesService } from './level2-addresses.service';

@ApiTags('Level2 Addresses')
@Controller('level2-addresses')
export class Level2AddressesController {
    constructor(private level2AddressesService: Level2AddressesService) {}

    @Get()
    @UseGuards(new IsEmployeeGuard())
    async getAll(@CurrentUser() user) {
      return await this.level2AddressesService.findAll(user.id, ['parent']);
    }
  
    @Post()
    @UsePipes(new ValidationPipe())
    @UseGuards(new IsEmployeeGuard())
    async store(@Body() data: StoreLevel2Address, @CurrentUser() user: User) {
      return await this.level2AddressesService.store(data, user.company_id);
    }

    @Put(':id')
    @UseGuards(new IsEmployeeGuard())
    async update(
      @CurrentUser() user: User,
      @Param('id') id: string,
      @Body() data: UpdateLevel2AddressDTO,
    ) {
      return await this.level2AddressesService.update(id, data, user.id);
    }
  
    @Get(':id')
    @UseGuards(new IsEmployeeGuard())
    async getOneById(@CurrentUser() user, @Param('id') id: string) {
      return await this.level2AddressesService.findByIdOrFail(id);
    }
  
    @Delete(':id')
    @UseGuards(new IsEmployeeGuard())
    async delete(@CurrentUser() user, @Param('id') id: string) {
      return await this.level2AddressesService.delete(id, user.id);
    }
  
    @Get(':id/children')
  @UseGuards(new IsEmployeeGuard())
  async getChildren(@CurrentUser() user, @Param('id') id: string) {
    return await this.level2AddressesService.findChildren(id);
  }
}
