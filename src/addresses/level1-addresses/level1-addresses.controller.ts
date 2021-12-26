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
    ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/user.entity';
import { StoreLevel1Address } from './dtos/create-level1-address.dto';
import { UpdateLevel1AddressDTO } from './dtos/update-level1-address.dto';
import { Level1AddressesService } from './level1-addresses.service';

@ApiTags('Level1 Addresses')
@Controller('level1-addresses')
export class Level1AddressesController {
  constructor(private level1AddressesService: Level1AddressesService) {}

  @Get()
  @UseGuards(new IsEmployeeGuard())
  async getAll(@CurrentUser() user) {
    return await this.level1AddressesService.findAll(user.id, ['parent']);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(new IsEmployeeGuard())
  async store(@Body() data: StoreLevel1Address, @CurrentUser() user: User) {
    return await this.level1AddressesService.store(data, user.company_id);
  }

  @Put(':id')
  @UseGuards(new IsEmployeeGuard())
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateLevel1AddressDTO,
  ) {
    return await this.level1AddressesService.update(id, data, user.id);
  }

  @Get(':id')
  @UseGuards(new IsEmployeeGuard())
  async getOneById(@CurrentUser() user, @Param('id') id: string) {
    return await this.level1AddressesService.findByIdOrFail(id);
  }

  @Delete(':id')
  @UseGuards(new IsEmployeeGuard())
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return await this.level1AddressesService.delete(id, user.id);
  }
}
