import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoicesService } from 'src/invoices/invoices.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TasksService {
  constructor(
    private invoicesService: InvoicesService,
    private usersService: UsersService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateInvoicesDaily() {
    const users = await this.usersService.findCreatedThisDay();
    const ids = users.map((user) => user.id);
    await this.invoicesService.generateUsersInvoices(ids);
  }
}
