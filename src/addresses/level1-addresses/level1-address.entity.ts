import { BaseEntity } from 'src/common/entities/baseEntity';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Level2Address } from '../level2-addresses/level2-address.entity';

@Entity()
export class Level1Address extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: false })
  company_id: string;

  @Column({ nullable: true })
  parent_id: string;

  @ManyToOne((type) => Company, (company) => company.level1Addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne((type) => Level2Address, (address) => address.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id'})
  parent?: Level2Address;

  @OneToMany((type) => User, (user) => user.address)
  users?: User[];
}
