import { Exclude } from 'class-transformer';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { BCRYPT_SALT, CRYPTO_IV, CRYPTO_KEY, CRYPTO_SECRET } from 'src/common/constants';
import * as argon from 'argon2';
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
} from 'typeorm';
import { promisify } from 'util';
import { Level1Address } from './../addresses/level1-addresses/level1-address.entity';
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

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

  @ManyToOne((type) => Level1Address, (address) => address.users, {
    nullable: true,
  })
  @JoinColumn({ name: 'address_id' })
  address: Level1Address;

  @ManyToOne((type) => User, (user) => user.customers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'collector_id' })
  collector?: User;

  @Exclude()
  @OneToMany((type) => Company, (company) => company.createdBy)
  companies: Company[];

  @Exclude()
  @OneToMany((type) => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @Exclude()
  @OneToMany((type) => Invoice, (invoice) => invoice.collectedBy)
  collectedInvoices: Invoice[];

  @Exclude()
  @OneToMany((type) => User, (user) => user.collector)
  customers: User[];

  @ManyToMany((type) => Plan, (plan) => plan.users)
  @JoinTable()
  plans: Plan[];

  @BeforeInsert()
  async hashPassword() {
    // const cipher = createCipheriv('aes-256-ctr', CRYPTO_KEY, CRYPTO_IV);
    // const encryptedText = Buffer.concat([
    //   cipher.update(password),
    //   cipher.final(),
    // ]);
    this.username = this.username
      ? this.username
      : removeSpecialCharacters(this.name) + (Date.now());
    // this.password = encryptedText.toString('hex');
    const password = this.password ? this.password : this.username;
    const hash = await argon.hash(password);
    this.password = hash;
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

  public get isExpired(): boolean {
    const expiryDate = new Date(this.expiryDate);
    const today = new Date();
    return expiryDate < today;
  }
}
