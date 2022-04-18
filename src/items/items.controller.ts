import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { CreateItemDTO } from './dtos/create-item.dto';
import { ItemsService } from './items.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.SUPERVISOR)
  @UseGuards(new IsEmployeeGuard(), RolesGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreateItemDTO,
    @CurrentUser() user: User,
  ) {
    return await this.itemsService.update(id, body, user);
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.SUPERVISOR)
  @UseGuards(new IsEmployeeGuard(), RolesGuard)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: User,
  ) {
    return await this.itemsService.updateStatus(id, body, user);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get('company/:company_id')
  async getByCompanyId(
    @Param('company_id') companyId: string,
    @Query('isActive') isActive: boolean,
  ) {
    return await this.itemsService.findByCompanyId(companyId, isActive);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @UsePipes(new ValidationPipe())
  @Post('company/:company_id')
  async store(@Body() body: CreateItemDTO) {
    return await this.itemsService.store(body);
  }
}
