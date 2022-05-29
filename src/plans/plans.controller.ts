import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { CreatePlanDTO } from './dtos/create-plan.dto';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.SUPERVISOR)
  @UseGuards(new IsEmployeeGuard(), RolesGuard)
  @Patch(':id/status')
  async updateStatus(
    @Body() body: { id: string; isActive: boolean },
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return await this.plansService.updateStatus(id, body.isActive, user);
  }

  @UseGuards(new AuthGuard())
  @Get('')
  async getByCompanyId(
    @Query('isActive') isActive: boolean,
    @CurrentUser() user: User,
  ) {
    return await this.plansService.findByCompanyId(user.company_id, isActive);
  }

  @UseGuards(new AdminGuard())
  @UsePipes(new ValidationPipe())
  @Post()
  async store(@Body() body: CreatePlanDTO, @CurrentUser() user: User) {
    return await this.plansService.store(body);
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreatePlanDTO,
    @CurrentUser() user: User,
  ) {
    return await this.plansService.update(id, body, user);
  }
}
