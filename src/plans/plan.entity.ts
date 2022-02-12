import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity('plans')
export class Plan extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: false })
  company_id: string;

  @ManyToOne((type) => Company, (company) => company.plans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToMany((type) => Invoice, (invoice) => invoice.plans)
  invoices: Invoice[];

  @ManyToMany((type) => User, (user) => user.plans)
  users: User[];
}
