import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { CurrentUser } from './common/decorators/user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/stats')
  @UseGuards(new AuthGuard())
  async getStats(@CurrentUser() user): Promise<any> {
    return await this.appService.getStats(user);
  }
}
