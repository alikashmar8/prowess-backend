import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { CreateItemDTO } from './dtos/create-item.dto';
import { ItemsService } from './items.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

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
