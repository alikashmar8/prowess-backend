import { BaseEntity } from 'src/common/entities/baseEntity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Level1Address extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne((type) => Level2Address, (address) => address.children, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  parent?: Level2Address;
}
