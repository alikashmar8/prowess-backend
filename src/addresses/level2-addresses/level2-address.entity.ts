import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Level1Address } from '../level1-addresses/level1-address.entity';
import { Level3Address } from '../level3-addresses/level3-address.entity';

@Entity()
export class Level2Address extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: false })
  company_id: string;

  @Column({ nullable: true })
  parent_id?: string;

  @ManyToOne((type) => Company, (company) => company.level2Addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne((type) => Level3Address, (address) => address.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Level3Address;

  @OneToMany((type) => Level1Address, (address) => address.parent, {
    nullable: true,
  })
  children?: Level1Address[];
}
