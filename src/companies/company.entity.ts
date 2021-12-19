import { AddressesEnum } from 'src/addresses/enums/addresses.enum';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/baseEntity';
import { Item } from './../items/item.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({ default: 1, nullable: true })
  maxManagersNumber: number;

  @Column({ default: 1, nullable: true })
  maxSupervisorsNumber: number;

  @Column({ default: 1, nullable: true })
  maxCollectorsNumber: number;

  @Column({ default: 1, nullable: true })
  maxCustomersNumber: number;

  @Column({ type: 'enum', enum: AddressesEnum, default: AddressesEnum.CITY })
  maxLocationToEnter: AddressesEnum;

  @Column({ nullable: true })
  createdBy_id?: string;

  @Column({ nullable: true })
  parentCompany_id?: string;

  @ManyToOne((type) => User, (user) => user.companies, { nullable: true })
  @JoinColumn({ name: 'createdBy_id' })
  createdBy: User;

  @ManyToOne((type) => Company, (company) => company.subCompanies, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentCompany_id' })
  parentCompany: Company;

  @OneToMany((type) => Company, (company) => company.parentCompany)
  subCompanies: Company[];

  @OneToMany((type) => Item, (item) => item.company)
  items: Item[];

  @OneToMany((type) => Item, (item) => item.company)
  plans: Plan[];

  @OneToMany((type) => User, (user) => user.company)
  users: User[];
}
