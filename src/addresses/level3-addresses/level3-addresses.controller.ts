import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/user.entity';
import { StoreLevel3Address } from './dtos/store-level3-address.dto';
import { UpdateLevel3AddressDTO } from './dtos/update-level3-address.dto';
import { Level3AddressesService } from './level3-addresses.service';

@ApiTags('Level3 Addresses')
@Controller('level3-addresses')
export class Level3AddressesController {
  constructor(private level3AddressesService: Level3AddressesService) {}

  @Get()
  @UseGuards(new IsEmployeeGuard())
  async getAll(@CurrentUser() user) {
    return await this.level3AddressesService.findAll(user.id, ['parent']);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(new IsEmployeeGuard())
  async store(@Body() data: StoreLevel3Address, @CurrentUser() user: User) {
    return await this.level3AddressesService.store(data, user.company_id);
  }

  @Put(':id')
  @UseGuards(new IsEmployeeGuard())
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateLevel3AddressDTO,
  ) {
    return await this.level3AddressesService.update(id, data, user.id);
  }

  @Get(':id')
  @UseGuards(new IsEmployeeGuard())
  async getOneById(@CurrentUser() user, @Param('id') id: string) {
    return await this.level3AddressesService.findByIdOrFail(id);
  }

  @Delete(':id')
  @UseGuards(new IsEmployeeGuard())
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return await this.level3AddressesService.delete(id, user.id);
  }

  @Get(':id/children')
  @UseGuards(new IsEmployeeGuard())
  async getChildren(@CurrentUser() user, @Param('id') id: string) {
    return await this.level3AddressesService.findChildren(id);
  }
}
