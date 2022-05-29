import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from './companies/companies.service';
import { Invoice } from './invoices/invoice.entity';
import { InvoicesService } from './invoices/invoices.service';
import { UserRoles } from './users/enums/user-roles.enum';
import { User } from './users/user.entity';

@Injectable()
export class AppService {
  constructor(
    private companiesService: CompaniesService,
    private invoicesService: InvoicesService,
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
  ) {}

  async getStats(user: User): Promise<any> {
    let startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    var endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const customers_count = (
      await this.companiesService.getCompanyCustomers(user.company_id, user)
    ).count;

    const unpaid_invoices_count: number = (
      await this.invoicesService.findUnpaidInvoices(user)
    ).length;

    let amount_collected_query: any = this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('user.collector', 'collector')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .leftJoinAndSelect('invoice.plans', 'plan')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('user.company_id = :company_id', {
        company_id: user.company_id,
      });
    if (user.role != UserRoles.ADMIN && user.role != UserRoles.MANAGER) {
      amount_collected_query = amount_collected_query.andWhere(
        'invoice.collectedBy_id = :collectedBy_id',
        {
          collectedBy_id: user.id,
        },
      );
    }

    amount_collected_query = await amount_collected_query
      .andWhere(
        `invoice.collected_at
          BETWEEN :begin
          AND :end`,
        { begin: startOfDay, end: endOfDay },
      )
      .select('SUM(invoice.total)', 'total')
      .getRawOne();
    const amount_collected_today = amount_collected_query.total;    

    return {
      unpaid_invoices_count: unpaid_invoices_count ? unpaid_invoices_count : 0,
      customers_count: customers_count ? customers_count : 0,
      amount_collected_today: amount_collected_today
        ? amount_collected_today
        : 0,
    };
  }
  getHello(): string {
    return 'Hello World!';
  }
}
