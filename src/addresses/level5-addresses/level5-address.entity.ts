import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Level4Address } from '../level4-addresses/level4-address.entity';

@Entity()
export class Level5Address extends BaseEntity {
  @Column()
  name: string;
  
  @Column({ nullable: false })
  company_id: string;

  @ManyToOne((type) => Company, (company) => company.level5Addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany((type) => Level4Address, (address) => address.parent, {
    nullable: true,
  })
  children?: Level4Address[];
}
