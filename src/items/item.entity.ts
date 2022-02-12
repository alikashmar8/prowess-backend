import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne
} from 'typeorm';

@Entity('items')
export class Item extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({ nullable: true })
  quantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: false })
  company_id: string;

  @ManyToOne((type) => Company, (company) => company.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToMany((type) => Invoice, (invoice) => invoice.items)
  invoices: Invoice[];
}
