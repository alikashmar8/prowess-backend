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
import { StoreLevel5AddressDTO } from './dtos/store-level5-address.dto';
import { UpdateLevel5AddressDTO } from './dtos/update-level5-address.dto';
import { Level5AddressesService } from './level5-addresses.service';
@ApiTags('Level5 Addresses')
@UsePipes(new ValidationPipe())
@Controller('level5-addresses')
export class Level5AddressesController {
  constructor(private level5AddressesService: Level5AddressesService) {}

  @Get()
  @UseGuards(new IsEmployeeGuard())
  async getAll(@CurrentUser() user) {
    return await this.level5AddressesService.findAll(user.id);
  }

  @Put(':id')
  @UseGuards(new IsEmployeeGuard())
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateLevel5AddressDTO,
  ) {
    return await this.level5AddressesService.update(id, data, user.id);
  }

  @Get(':id')
  @UseGuards(new IsEmployeeGuard())
  async getOneById(@CurrentUser() user, @Param('id') id: string) {
    return await this.level5AddressesService.findByIdOrFail(id);
  }

  @Delete(':id')
  @UseGuards(new IsEmployeeGuard())
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return await this.level5AddressesService.delete(id, user.id);
  }

  @Post()
  @UseGuards(new IsEmployeeGuard())
  async store(@Body() data: StoreLevel5AddressDTO, @CurrentUser() user: User) {
    return await this.level5AddressesService.store(data, user.company_id);
  }

  
  @Get(':id/children')
  @UseGuards(new IsEmployeeGuard())
  async getChildren(@CurrentUser() user, @Param('id') id: string) {
    return await this.level5AddressesService.findChildren(id);
  }
}
