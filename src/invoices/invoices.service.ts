import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectListDTO } from 'src/common/dtos/collect-list.dto';
import { Item } from 'src/items/item.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { InvoiceTypes } from './enums/invoice-types.enum';
import { Invoice } from './invoice.entity';
import { getPlansTotal } from '../common/utils/functions';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
    @InjectRepository(Item) private itemsRepository: Repository<Item>,
  ) {}

  async generateUsersInvoices(usersIds: string[]) {
    const users = await this.usersRepository.find({
      where: {
        id: In(usersIds),
      },
      relations: ['plans'],
    });

    users.forEach(async (user: User) => {
      await this.invoicesRepository.save({
        isFirstPayment: false,
        isPaid: false,
        plans: user.plans,
        total: getPlansTotal(user.plans),
        type: InvoiceTypes.PLANS_INVOICE,
        user: user,
        note: 'Monthly Auto Generated Invoice',
      });
    });

    return true;
  }

  async findUnpaidInvoices(company_id: string) {
    return await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .where('user.company_id = :company_id', { company_id })
      .andWhere('invoice.isPaid = :condition', { condition: false })
      .getMany();
  }

  async findById(id: string, relations?: string[]) {
    return await this.invoicesRepository
      .findOneOrFail(id, {
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('Invoice Not Found!');
      });
  }

  async store(data: CreateInvoiceDTO) {
    const plans_ids = data.plans;
    const items_ids = data.items;

    const invoice = await this.invoicesRepository
      .save({
        dueDate: data.dueDate,
        extraAmount: data.extraAmount,
        isFirstPayment: data.isFirstPayment,
        isPaid: data.isPaid,
        notes: data.notes,
        total: data.total,
        type: data.type,
        user_id: data.user_id,
        collectedBy_id: data.collectedBy_id,
        collected_at: data.collected_at,
      })
      .catch(() => {
        throw new BadRequestException('Error Creating Invoice');
      });

    const plans = await this.plansRepository.find({
      where: {
        id: In(plans_ids),
      },
    });
    const items = await this.itemsRepository.find({
      where: {
        id: In(items_ids),
      },
    });
    invoice.items = items;
    invoice.plans = plans;

    return await this.invoicesRepository.save(invoice);
  }

  forgive(data: CollectListDTO) {
    data.ids.forEach(async (id) => {
      await this.invoicesRepository.update(id, {
        isPaid: true,
        total: 0,
        collectedBy_id: data.collector_id,
        collected_at: new Date(),
      });
    });
  }

  async findThisMonthInvoices(company_id: any) {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);

    return await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .where('user.company_id = :company_id', { company_id })
      .andWhere(
        `invoice.dueDate
          BETWEEN :begin
          AND :end`,
        { begin: firstDay, end: lastDay },
      )
      .getMany();
  }

  async collect(data: CollectListDTO) {
    await data.ids.forEach(async (id) => {
      await this.invoicesRepository.update(id, {
        isPaid: true,
        collectedBy_id: data.collector_id,
        collected_at: new Date(),
      });
    });
    return true;
  }

  async findCustomerInvoices(customer_id: string, type?: InvoiceTypes) {
    let query = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('invoice.plans', 'plans')
      .leftJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user_id = :customer_id', { customer_id });
    if (type) {
      query = query.andWhere('invoice.type = :type', { type });
    }
    return await query.getMany();
  }

  async getCustomerUnpaidInvoices(customer_id: string) {
    return await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .where('user.id = :customer_id', { customer_id })
      .andWhere('invoice.isPaid = :condition', { condition: false })
      .getMany();
  }
}
