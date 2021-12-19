import { User } from 'src/users/user.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/baseEntity';

@Entity('addresses')
export class Address extends BaseEntity {
  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  area?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  building?: string;

  @Column({ nullable: true })
  notes?: string;

  @OneToOne((type) => User, (user) => user.address)
  user: User;
}
