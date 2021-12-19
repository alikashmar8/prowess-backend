import { Controller, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
}
