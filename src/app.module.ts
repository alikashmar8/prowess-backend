import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from './addresses/addresses.module';
import { AdminCompaniesModule } from './admin/companies/companies.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { CompaniesService } from './companies/companies.service';
import { Company } from './companies/company.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoicesModule } from './invoices/invoices.module';
import { InvoicesService } from './invoices/invoices.service';
import { Item } from './items/item.entity';
import { ItemsModule } from './items/items.module';
import { Plan } from './plans/plan.entity';
import { PlansModule } from './plans/plans.module';
import { TasksService } from './tasks/tasks.service';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'admin',
      password: 'admin',
      database: 'prowess_db',
      synchronize: true,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['src/migrations/**/*.ts'],
    }),
    UsersModule,
    CompaniesModule,
    AddressesModule,
    InvoicesModule,
    PlansModule,
    ItemsModule,
    AuthModule,
    AdminCompaniesModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User, Company, Invoice, Plan, Item]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TasksService,
    InvoicesService,
    UsersService,
    CompaniesService,
  ],
})
export class AppModule {}
