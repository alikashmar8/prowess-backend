import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateSuperAdminDTO } from './dtos/create-super-admin.dto';
import { LoginDTO } from './dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.login(loginDto);
  }

  @Post('createSuperAdmin')
  @UsePipes(new ValidationPipe())
  async createSuperAdmin(@Body() body: CreateSuperAdminDTO) {
    return await this.authService.createSuperAdmin(body);
  }
}
