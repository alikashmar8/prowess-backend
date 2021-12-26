import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { StoreLevel5AddressDTO } from './dtos/store-level5-address.dto';
import { UpdateLevel5AddressDTO } from './dtos/update-level5-address.dto';
import { Level5Address } from './level5-address.entity';

@Injectable()
export class Level5AddressesService {
  async findChildren(id: string) {
    const address = await this.findByIdOrFail(id, ['children']);
    return address.children;
  }
  constructor(
    @InjectRepository(Level5Address)
    private level5AddressRepository: Repository<Level5Address>,
    private usersService: UsersService,
  ) {}

  async findAll(requesterId: string, relations?: string[]) {
    const user = await this.usersService.findUserByIdOrFail(requesterId);

    if (user.isSuperAdmin) {
      return this.level5AddressRepository.find();
    } else {
      return this.level5AddressRepository.find({
        where: {
          company_id: user.company_id,
        },
      });
    }
  }

  async store(data: StoreLevel5AddressDTO, companyId: string) {
    return await this.level5AddressRepository
      .save({ ...data, company_id: companyId })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
  }

  async findByIdOrFail(id: string, relations?: string[]) {
    return await this.level5AddressRepository
      .findOneOrFail(id, {
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('Address not found');
      });
  }

  async update(id: string, data: UpdateLevel5AddressDTO, requesterId: string) {
    let address = await this.findByIdOrFail(id);
    const user = await this.usersService.findByIdOrFail(requesterId);
    if (address.company_id != user.company_id)
      throw new HttpException(
        "You don't have permission to perform this action",
        HttpStatus.FORBIDDEN,
      );
    return await this.level5AddressRepository.update(id, data);
  }

  async delete(id: string, requesterId: string) {
    const user = await this.usersService.findByIdOrFail(requesterId);
    const address = await this.findByIdOrFail(id);

    if (user.company_id != address.company_id)
      throw new HttpException(
        "You don't have permission to perform this action",
        HttpStatus.FORBIDDEN,
      );

    return await this.level5AddressRepository.delete(id).catch((err) => {
      throw new BadRequestException(
        'Cannot delete address, address might be linked to some users',
      );
    });
  }
}
