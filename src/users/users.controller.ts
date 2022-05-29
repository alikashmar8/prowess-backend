import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UpdateUserPlansDTO } from './dtos/update-user-plans.dto';
import { UserRoles } from './enums/user-roles.enum';
import { User } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put(':id/make-active')
  async makeUserActive(@Param('id') id: string) {
    return await this.usersService.updateUser(id, { isActive: true });
  }

  @Put(':id/make-inactive')
  async makeUserInactive(@Param('id') id: string) {
    return await this.usersService.updateUser(id, { isActive: false });
  }

  @UseGuards(new AuthGuard())
  @Get(':id')
  async getUserById(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.usersService.findByIdOrFail(id, ['plans']);
    if (user.company_id != currentUser.company_id) {
      throw new ForbiddenException('You are not allowed to view this user');
    }
    return user;
  }

  @UseGuards(new AuthGuard())
  @Patch(':id/plans')
  async updateUserPlans(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() body: UpdateUserPlansDTO,
  ) {
    const user = await this.usersService.findByIdOrFail(id);
    if (user.company_id != currentUser.company_id) {
      throw new ForbiddenException('You are not allowed to update this user');
    }
    if (user.role != UserRoles.CUSTOMER) {
      throw new BadRequestException("Can't add plans to non customers");
    }
    return await this.usersService.updateUserPlans(id, body, currentUser);
  }
}
