import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Level2Address } from '../level2-addresses/level2-address.entity';
import { Level4Address } from '../level4-addresses/level4-address.entity';

@Entity()
export class Level3Address extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: false })
  company_id: string;

  @Column({ nullable: true })
  parent_id: string;

  @ManyToOne((type) => Company, (company) => company.level3Addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;


  @ManyToOne((type) => Level4Address, (address) => address.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id'})
  parent?: Level4Address;

  @OneToMany((type) => Level2Address, (address) => address.parent, {
    nullable: true,
  })
  children?: Level2Address[];
}
