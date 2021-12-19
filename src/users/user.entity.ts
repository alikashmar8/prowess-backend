import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Address } from 'src/addresses/address.entity';
import { BCRYPT_SALT } from 'src/common/constants';
import { BaseEntity } from 'src/common/entities/baseEntity';
import { removeSpecialCharacters } from 'src/common/utils/functions';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { Plan } from 'src/plans/plan.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRoles } from './enums/user-roles.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.CUSTOMER })
  role: UserRoles;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({ nullable: true })
  address_id?: string;

  @Column({ nullable: true })
  company_id?: string;

  @Column({ nullable: true })
  collector_id?: string;

  @ManyToOne((type) => Company, (company) => company.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne((type) => Address, (address) => address.user, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToOne((type) => User, (user) => user.customers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'collector_id' })
  collector: User;

  @Exclude()
  @OneToMany((type) => Company, (company) => company.createdBy)
  companies: Company[];

  @Exclude()
  @OneToMany((type) => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @Exclude()
  @OneToMany((type) => User, (user) => user.collector)
  customers: User[];

  @ManyToMany((type) => Plan, (plan) => plan.users)
  @JoinTable()
  plans: Plan[];

  @BeforeInsert()
  async hashPassword() {
    this.username = this.username
      ? this.username
      : removeSpecialCharacters(this.name);
    this.password = this.password
      ? await bcrypt.hash(this.password, BCRYPT_SALT)
      : await bcrypt.hash(this.username, BCRYPT_SALT);
    this.email = this.email ? this.email.toLowerCase() : null;
  }

  public get isEmployee(): boolean {
    if (
      this.role == UserRoles.CUSTOMER ||
      this.isSuperAdmin ||
      !this.company_id
    )
      return false;
    return true;
  }
}
