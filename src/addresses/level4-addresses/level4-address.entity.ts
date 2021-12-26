import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Level3Address } from '../level3-addresses/level3-address.entity';
import { Level5Address } from '../level5-addresses/level5-address.entity';

@Entity()
export class Level4Address extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: false })
  company_id: string;

  @Column({ nullable: true })
  parent_id: string;

  @ManyToOne((type) => Company, (company) => company.level4Addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne((type) => Level5Address, (address) => address.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id'})
  parent?: Level5Address;

  @OneToMany((type) => Level3Address, (address) => address.parent, {
    nullable: true,
  })
  children?: Level3Address[];
}
