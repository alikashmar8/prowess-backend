import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoicesService } from 'src/invoices/invoices.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TasksService {
  constructor(
    private invoicesService: InvoicesService,
    private usersService: UsersService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateInvoicesDaily() {
    const users = await this.usersService.findAllActiveCustomers();
    const ids = users.map((user) => user.id);    
    await this.invoicesService.generateUsersInvoices(ids);
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async checkInactiveUsers() {
    const users: User[] = await this.usersService.findExpiredActiveUsers();
    const ids = users.map((user) => user.id);
    const result = await this.usersService.updateUsersStatus(ids, false);
    console.log('update users to inactive result:  ', result);
  }
}
