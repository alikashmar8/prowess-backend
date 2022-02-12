import { BaseEntity } from 'src/common/entities/baseEntity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { Item } from './../items/item.entity';
import { InvoiceTypes } from './enums/invoice-types.enum';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'decimal', default: 0 })
  total: number;

  @Column({ type: 'decimal', default: 0 })
  extraAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: InvoiceTypes,
    default: InvoiceTypes.PLANS_INVOICE,
  })
  type: InvoiceTypes;

  @Column({ default: false })
  isFirstPayment: boolean;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  user_id: string;

  @ManyToOne((type) => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany((type) => Item, (item) => item.invoices, { onDelete: 'CASCADE' })
  @JoinTable()
  items?: Item[];

  @ManyToMany((type) => Plan, (plan) => plan.invoices, { onDelete: 'CASCADE' })
  @JoinTable()
  plans?: Plan[];
}
