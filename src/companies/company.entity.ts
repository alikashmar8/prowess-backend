import { AddressesLevel } from 'src/addresses/enums/addresses.enum';
import { Level1Address } from 'src/addresses/level1-addresses/level1-address.entity';
import { Level2Address } from 'src/addresses/level2-addresses/level2-address.entity';
import { Level3Address } from 'src/addresses/level3-addresses/level3-address.entity';
import { Level4Address } from 'src/addresses/level4-addresses/level4-address.entity';
import { Level5Address } from 'src/addresses/level5-addresses/level5-address.entity';
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

  @Column({
    type: 'enum',
    enum: AddressesLevel,
    default: AddressesLevel.LEVEL3,
  })
  maxLocationLevel: AddressesLevel;

  @Column({ nullable: true })
  addressLevel1Name: string;

  @Column({ nullable: true })
  addressLevel2Name: string;

  @Column({ nullable: true })
  addressLevel3Name: string;

  @Column({ nullable: true })
  addressLevel4Name: string;

  @Column({ nullable: true })
  addressLevel5Name: string;

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

  @OneToMany((type) => Level1Address, (address) => address.company)
  level1Addresses: Level1Address[];

  @OneToMany((type) => Level2Address, (address) => address.company)
  level2Addresses: Level2Address[];

  @OneToMany((type) => Level3Address, (address) => address.company)
  level3Addresses: Level3Address[];

  @OneToMany((type) => Level4Address, (address) => address.company)
  level4Addresses: Level4Address[];

  @OneToMany((type) => Level5Address, (address) => address.company)
  level5Addresses: Level5Address[];
}
