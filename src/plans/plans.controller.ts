import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { CreatePlanDTO } from './dtos/create-plan.dto';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @UseGuards(new OwnCompanyGuard())
  @Get('company/:company_id')
  async getByCompanyId(
    @Param('company_id') companyId: string,
    @Query('isActive') isActive: boolean,
  ) {    
    return await this.plansService.findByCompanyId(companyId, isActive);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @UsePipes(new ValidationPipe())
  @Post('company/:company_id')
  async store(@Body() body: CreatePlanDTO) {
    return await this.plansService.store(body);
  }
}
