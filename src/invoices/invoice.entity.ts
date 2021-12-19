import { Item } from './../items/item.entity';
import { BaseEntity } from 'src/common/entities/baseEntity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { InvoiceTypes } from './enums/invoice-types.enum';
import { Plan } from 'src/plans/plan.entity';

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
  notes: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  item_id?: string;

  @Column({ nullable: true })
  plan_id?: string;

  @ManyToOne((type) => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne((type) => Item, (item) => item.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item?: Item;

  @ManyToOne((type) => Plan, (plan) => plan.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan?: Plan;
}
