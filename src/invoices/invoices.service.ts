import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { CollectListDTO } from 'src/common/dtos/collect-list.dto';
import {
  getInvoicePdf,
  getInvoicesReportHtml,
} from 'src/common/utils/reports-html';
import { Item } from 'src/items/item.entity';
import { Plan } from 'src/plans/plan.entity';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { Brackets, In, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import {
  getAddressesRelationsListWithUserKeyword,
  getAddressString,
  getPlansTotal,
} from '../common/utils/functions';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { InvoiceTypes } from './enums/invoice-types.enum';
import { Invoice } from './invoice.entity';
var pdf = require('html-pdf');

@Injectable()
export class InvoicesService {
  async findAll(
    currentUser: User,
    data?: {
      search?: string;
      employee_id?: string;
      plan_id?: string;
      start_date?: Date;
      end_date?: Date;
      isPaid?: boolean;
      type: InvoiceTypes;
    },
  ) {
    let query: any = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('user.collector', 'collector')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .leftJoinAndSelect('invoice.plans', 'plan')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('user.company_id = :company_id', {
        company_id: currentUser.company_id,
      });
    if (
      currentUser.role != UserRoles.ADMIN &&
      currentUser.role != UserRoles.MANAGER
    ) {
      query = query.andWhere('user.collector_id = :collector_id', {
        collector_id: currentUser.id,
      });
    }
    if (data) {
      if (data.search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('user.name like :name', { name: `%${data.search}%` })
              .orWhere('user.username like :username', {
                username: `%${data.search}%`,
              })
              .orWhere('invoice.notes like :note', { note: `%${data.search}%` })
              .orWhere('invoice.total like :total', {
                total: `%${data.search}%`,
              })
              .orWhere('invoice.dueDate like :date', {
                date: `%${data.search}%`,
              });
          }),
        );
      }
      if (data.employee_id) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('user.collector_id = :employee_id', {
              employee_id: data.employee_id,
            }).orWhere('invoice.collectedBy_id = :employee_id', {
              employee_id: data.employee_id,
            });
          }),
        );
      }
      if (data.plan_id) {
        query = query.andWhere('plan.id = :plan_id', { plan_id: data.plan_id });
      }
      if (data.start_date && data.end_date) {
        let start_date = new Date(data.start_date);
        start_date.setHours(0, 0, 0, 0);
        let end_date = new Date(data.end_date);
        end_date.setHours(23, 59, 59, 999);
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('invoice.dueDate BETWEEN :start_date AND :end_date', {
              start_date: start_date,
              end_date: end_date,
            }).orWhere(
              'invoice.collected_at BETWEEN :start_date AND :end_date',
              {
                start_date: start_date,
                end_date: end_date,
              },
            );
          }),
        );
      } else {
        if (data.start_date) {
          let start_date = new Date(data.start_date);
          start_date.setHours(0, 0, 0, 0);
          query = query.andWhere(
            new Brackets((qb) => {
              qb.where('invoice.dueDate >= :start_date', {
                start_date: start_date,
              }).orWhere('invoice.collected_at >= :start_date', {
                start_date: start_date,
              });
            }),
          );
        }
        if (data.end_date) {
          let end_date = new Date(data.end_date);
          end_date.setHours(23, 59, 59, 999);
          query = query.andWhere(
            new Brackets((qb) => {
              qb.where('invoice.dueDate <= :end_date', {
                end_date: end_date,
              }).orWhere('invoice.collected_at <= :end_date', {
                end_date: end_date,
              });
            }),
          );
        }
      }
      if (data.isPaid != null) {
        if (typeof data.isPaid == 'string') {
          if (data.isPaid == 'true') {
            data.isPaid = true;
          } else if (data.isPaid == 'false') {
            data.isPaid = false;
          }
        }
        query = query.andWhere('invoice.isPaid = :isPaid', {
          isPaid: data.isPaid,
        });
      }
      if (data.type) {
        query = query.andWhere('invoice.type = :type', { type: data.type });
      }
    }

    query = await query.orderBy('invoice.dueDate', 'DESC').getMany();
    return query;
  }
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
        dueDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          user.paymentDate.getDate(),
        ),
        plans: user.plans,
        total: getPlansTotal(user.plans),
        type: InvoiceTypes.PLANS_INVOICE,
        user: user,
        note: 'Monthly Auto Generated Invoice',
      });
    });

    return true;
  }

  async findUnpaidInvoices(
    user: User,
    data?: {
      search?: string;
      employee_id?: string;
      plan_id?: string;
      start_date?: Date;
      end_date?: Date;
    },
  ) {
    let query: any = this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('user.collector', 'collector')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .leftJoinAndSelect('invoice.plans', 'plan')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('user.company_id = :company_id', { company_id: user.company_id })
      .andWhere('invoice.isPaid = :condition', { condition: false });
    if (user.role != UserRoles.ADMIN && user.role != UserRoles.MANAGER) {
      query = query.andWhere('user.collector_id = :collector_id', {
        collector_id: user.id,
      });
    }
    if (data) {
      if (data.search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('user.name like :name', { name: `%${data.search}%` })
              .orWhere('user.username like :username', {
                username: `%${data.search}%`,
              })
              .orWhere('invoice.notes like :note', { note: `%${data.search}%` })
              .orWhere('invoice.total like :total', {
                total: `%${data.search}%`,
              })
              .orWhere('invoice.dueDate like :date', {
                date: `%${data.search}%`,
              });
          }),
        );
      }
      if (data.employee_id) {
        query = query.andWhere('user.collector_id = :employee_id', {
          employee_id: data.employee_id,
        });
      }
      if (data.plan_id) {
        query = query.andWhere('plan.id = :plan_id', { plan_id: data.plan_id });
      }
      if (data.start_date) {
        query = query.andWhere('invoice.dueDate >= :start_date', {
          start_date: data.start_date,
        });
      }
      if (data.end_date) {
        query = query.andWhere('invoice.dueDate <= :end_date', {
          end_date: data.end_date,
        });
      }
    }

    query = await query.orderBy('invoice.dueDate', 'DESC').getMany();
    return query;
  }

  async findPaidInvoices(
    user: User,
    data?: {
      search?: string;
      employee_id?: string;
      plan_id?: string;
      start_date?: Date;
      end_date?: Date;
    },
  ): Promise<Invoice[]> {
    let query: any = this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('user.collector', 'collector')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .leftJoinAndSelect('invoice.plans', 'plan')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('user.company_id = :company_id', { company_id: user.company_id })
      .andWhere('invoice.isPaid = :condition', { condition: true });
    if (user.role != UserRoles.ADMIN && user.role != UserRoles.MANAGER) {
      query = query.andWhere('user.id = :user_id', { user_id: user.id });
    }
    if (data) {
      if (data.search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('user.name like :name', { name: `%${data.search}%` })
              .orWhere('user.username like :username', {
                username: `%${data.search}%`,
              })
              .orWhere('invoice.notes like :note', { note: `%${data.search}%` })
              .orWhere('invoice.total like :total', {
                total: `%${data.search}%`,
              })
              .orWhere('invoice.dueDate like :date', {
                date: `%${data.search}%`,
              });
          }),
        );
      }
      if (data.employee_id) {
        query = query.andWhere('user.collector_id = :employee_id', {
          employee_id: data.employee_id,
        });
      }
      if (data.plan_id) {
        query = query.andWhere('plan.id = :plan_id', { plan_id: data.plan_id });
      }
      if (data.start_date) {
        query = query.andWhere('invoice.dueDate >= :start_date', {
          start_date: data.start_date,
        });
      }
      if (data.end_date) {
        query = query.andWhere('invoice.dueDate <= :end_date', {
          end_date: data.end_date,
        });
      }
    }

    query = await query.orderBy('invoice.dueDate', 'DESC').getMany();
    return query;
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
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user.company_id = :company_id', { company_id })
      .andWhere(
        `invoice.dueDate
          BETWEEN :begin
          AND :end`,
        { begin: firstDay, end: lastDay },
      )
      .getMany();
  }

  async findInvoicesByMonth(company_id: any, date: Date, search?: string) {
    let year = date.getFullYear();
    let month = date.getMonth();
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);

    let query: any = this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user.company_id = :company_id', { company_id })
      .andWhere(
        `invoice.dueDate
          BETWEEN :begin
          AND :end`,
        { begin: firstDay, end: lastDay },
      );
    if (search) {
      query = await query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name like :name', { name: `%${search}%` })
            .orWhere('user.username like :username', {
              username: `%${search}%`,
            })
            .orWhere('invoice.notes like :note', { note: `%${search}%` })
            .orWhere('invoice.total like :total', { total: `%${search}%` })
            .orWhere('invoice.dueDate like :date', { date: `%${search}%` });
        }),
      );
    }
    return await query.orderBy('invoice.dueDate', 'DESC').getMany();
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
    query = query.orderBy('invoice.created_at', 'DESC');
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

  async generatePDF(res: Response, ids: string[], company_id: string) {
    const invoices = await this.invoicesRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['user', 'collectedBy'],
    });

    const currentUser = await this.usersRepository.findOne({
      where: {
        company_id,
      },
      relations: ['company'],
    });

    pdf
      .create(getInvoicesReportHtml(invoices, currentUser.company))
      .toStream(function (err, stream) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename=' +
            currentUser.company.name +
            '-invoices' +
            new Date().getDate() +
            '-' +
            (new Date().getMonth() + 1) +
            '-' +
            new Date().getFullYear() +
            '.pdf',
        });
        stream.pipe(res);
        return res;
      });
  }

  async generatePDFUnpaid(res, user: User) {
    const invoices = await this.findUnpaidInvoices(user);

    // to get relation
    const currentUser = await this.usersRepository.findOne({
      where: {
        company_id: user.company_id,
      },
      relations: ['company'],
    });

    pdf
      .create(getInvoicesReportHtml(invoices, currentUser.company))
      .toStream(function (err, stream) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename=' +
            currentUser.company.name +
            '-unpaid-invoices' +
            new Date().getDate() +
            '-' +
            (new Date().getMonth() + 1) +
            '-' +
            new Date().getFullYear() +
            '.pdf',
        });
        stream.pipe(res);
        return res;
      });
  }

  async generatePDFPaid(res: any, user: User) {
    const invoices = await this.findPaidInvoices(user);

    const currentUser = await this.usersRepository.findOne({
      where: {
        company_id: user.company_id,
      },
      relations: ['company'],
    });

    pdf
      .create(getInvoicesReportHtml(invoices, currentUser.company))
      .toStream(function (err, stream) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename=' +
            currentUser.company.name +
            '-paid-invoices' +
            new Date().getDate() +
            '-' +
            (new Date().getMonth() + 1) +
            '-' +
            new Date().getFullYear() +
            '.pdf',
        });
        stream.pipe(res);
        return res;
      });
  }

  async generatePDFByMonth(res, company_id: string, date: Date) {
    const invoices = await this.findInvoicesByMonth(company_id, date);

    const currentUser = await this.usersRepository.findOne({
      where: {
        company_id,
      },
      relations: ['company'],
    });

    pdf
      .create(getInvoicesReportHtml(invoices, currentUser.company))
      .toStream(function (err, stream) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename=' +
            currentUser.company.name +
            '-unpaid-invoices' +
            (date.getMonth() + 1) +
            '-' +
            date.getFullYear() +
            '.pdf',
        });
        stream.pipe(res);
        return res;
      });
  }

  async generateExcel(res: Response, ids: string[], company_id: string) {
    const invoices: any[] = await this.invoicesRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['user', 'collectedBy'],
    });

    let invoices_array = [
      [
        'ID',
        'Customer Name',
        'Phone Number',
        'Total',
        'Due Date',
        'Is Paid',
        'Collected At',
        'Collected By',
      ],
    ];

    invoices.forEach((invoice) => {
      invoices_array.push([
        invoice.id,
        invoice.user.name,
        invoice.user.phoneNumber,
        invoice.total + '',
        invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A',
        invoice.isPaid ? 'Yes' : 'No',
        invoice.collected_at
          ? invoice.collected_at.toLocaleDateString()
          : 'N/A',
        invoice.collectedBy ? invoice.collectedBy.name : '',
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(invoices_array);
    worksheet['!cols'] = this.fitToColumn(invoices_array);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const timestamp = new Date().getTime();
    XLSX.writeFile(workbook, `excels/invoices-${company_id}-${timestamp}.xlsx`);
    res.sendFile(`excels/invoices-${company_id}-${timestamp}.xlsx`, {
      root: './',
    });
  }
  async generateUnpaidExcel(res, company_id) {
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user.company_id = :company_id', { company_id })
      .andWhere('invoice.isPaid = :condition', { condition: false })
      .orderBy('invoice.dueDate', 'DESC')
      .select([
        'invoice.id as id',
        'user.name as customer',
        'user.phoneNumber as PhoneNumber',
        'invoice.dueDate as DueDate',
        'invoice.isPaid as IsPaid',
        'collectedBy.name as CollectedBy',
        'invoice.collected_at as CollectedAt',
        'invoice.total as Total',
      ])
      .getRawMany();
    const user = await this.usersRepository.findOne({
      where: {
        company_id,
      },
      relations: ['company'],
    });

    const wb = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(invoices);
    XLSX.utils.book_append_sheet(wb, newWorksheet, 'Invoices');
    const wbOptions = { bookType: 'xlsx', type: 'string', cellDates: true };
    const filename =
      user.company.name +
      '-' +
      new Date().getDate() +
      '-' +
      (new Date().getMonth() + 1) +
      '-' +
      new Date().getFullYear() +
      '.xlsx';
    // @ts-ignore
    XLSX.writeFile(wb, 'excels/' + filename, wbOptions);
    const stream = createReadStream(filename);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=' + filename,
    });
    stream.pipe(res);
    return res;
  }

  async generatePaidExcel(res, company_id) {
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user.company_id = :company_id', { company_id })
      .andWhere('invoice.isPaid = :condition', { condition: true })
      .orderBy('invoice.dueDate', 'DESC')
      .select([
        'invoice.id as id',
        'user.name as customer',
        'user.phoneNumber as PhoneNumber',
        'invoice.dueDate as DueDate',
        'invoice.isPaid as IsPaid',
        'collectedBy.name as CollectedBy',
        'invoice.collected_at as CollectedAt',
        'invoice.total as Total',
      ])
      .getRawMany();
    const user = await this.usersRepository.findOne({
      where: {
        company_id,
      },
      relations: ['company'],
    });

    const wb = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(invoices);
    XLSX.utils.book_append_sheet(wb, newWorksheet, 'Invoices');
    const wbOptions = { bookType: 'xlsx', type: 'string', cellDates: true };
    const filename =
      user.company.name +
      '-' +
      new Date().getDate() +
      '-' +
      (new Date().getMonth() + 1) +
      '-' +
      new Date().getFullYear() +
      '.xlsx';
    // @ts-ignore
    XLSX.writeFile(wb, 'excels/' + filename, wbOptions);
    const stream = createReadStream(filename);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=' + filename,
    });
    stream.pipe(res);
    return res;
  }

  async getInvoicePdf(res: Response, id: string, user: User) {
    const maxLocationLevel: any = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.company', 'company')
      .where('user.id = :user_id', { user_id: user.id })
      .select('company.maxLocationLevel')
      .getRawOne();
    console.log(maxLocationLevel.company_maxLocationLevel);

    let relations = getAddressesRelationsListWithUserKeyword(
      maxLocationLevel.company_maxLocationLevel,
    );
    const invoice = await this.findById(id, [
      'items',
      'plans',
      'collectedBy',
      'user',
      ...relations,
    ]);

    if (invoice.user.company_id != user.company_id) {
      throw new ForbiddenException('You are not allowed to view this invoice');
    }

    pdf
      .create(getInvoicePdf(invoice, getAddressString(invoice.user.address)))
      .toStream(function (err, stream) {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename=invoice-' +
            invoice.id +
            '-date-' +
            new Date().getDate() +
            '-' +
            (new Date().getMonth() + 1) +
            '-' +
            new Date().getFullYear() +
            '.pdf',
        });
        stream.pipe(res);
        return res;
      });
  }

  async generateExcelByMonth(res: Response, company_id: string, date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.collectedBy', 'collectedBy')
      .where('user.company_id = :company_id', { company_id })
      .andWhere(
        `invoice.dueDate
          BETWEEN :begin
          AND :end`,
        { begin: firstDay, end: lastDay },
      )
      .orderBy('invoice.dueDate', 'DESC')
      .select([
        'invoice.id as id',
        'user.name as customer',
        'user.phoneNumber as PhoneNumber',
        'invoice.dueDate as DueDate',
        'invoice.isPaid as IsPaid',
        'collectedBy.name as CollectedBy',
        'invoice.collected_at as CollectedAt',
        'invoice.total as Total',
      ])
      .getRawMany();
    const user = await this.usersRepository.findOne({
      where: {
        company_id,
      },
      relations: ['company'],
    });

    const wb = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(invoices);
    XLSX.utils.book_append_sheet(wb, newWorksheet, 'Invoices');
    const wbOptions = { bookType: 'xlsx', type: 'string', cellDates: true };
    const filename =
      user.company.name +
      '-' +
      new Date().getDate() +
      '-' +
      (new Date().getMonth() + 1) +
      '-' +
      new Date().getFullYear() +
      '.xlsx';
    // @ts-ignore
    XLSX.writeFile(wb, 'excels/' + filename, wbOptions);
    const stream = createReadStream(filename);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=' + filename,
    });
    stream.pipe(res);
    return res;
  }

  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0)),
      ),
    }));
  }
}
