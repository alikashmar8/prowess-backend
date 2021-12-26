import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { StoreLevel4AddressDTO } from './dtos/store-level4-address.dto';
import { UpdateLevel4AddressDTO } from './dtos/update-level4-address.dto';
import { Level4Address } from './level4-address.entity';

@Injectable()
export class Level4AddressesService {
  constructor(
    @InjectRepository(Level4Address)
    private level4AddressRepository: Repository<Level4Address>,
    private usersService: UsersService,
  ) {}

  async findAll(requesterId: string, relations?: string[]) {
    const user = await this.usersService.findUserByIdOrFail(requesterId);

    if (user.isSuperAdmin) {
      return this.level4AddressRepository.find();
    } else {
      return this.level4AddressRepository.find({
        where: {
          company_id: user.company_id,
        },
        relations: relations,
      });
    }
  }

  async store(data: StoreLevel4AddressDTO, companyId: string) {
    return await this.level4AddressRepository
      .save({ ...data, company_id: companyId })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
  }

  
  async findByIdOrFail(id: string, relations?: string[]) {
    return await this.level4AddressRepository
      .findOneOrFail(id, {
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('Address not found');
      });
  }

  async update(id: string, data: UpdateLevel4AddressDTO, requesterId: string) {
    let address = await this.findByIdOrFail(id);
    const user = await this.usersService.findByIdOrFail(requesterId);
    if (address.company_id != user.company_id)
      throw new HttpException(
        "You don't have permission to perform this action",
        HttpStatus.FORBIDDEN,
      );
    return await this.level4AddressRepository.update(id, data);
  }

  async delete(id: string, requesterId: string) {
    const user = await this.usersService.findByIdOrFail(requesterId);
    const address = await this.findByIdOrFail(id);

    if (user.company_id != address.company_id)
      throw new HttpException(
        "You don't have permission to perform this action",
        HttpStatus.FORBIDDEN,
      );
    return await this.level4AddressRepository.delete(id).catch((err) => {
      throw new BadRequestException('Cannot delete address, address might be linked to some users');
    });
  }

  async findChildren(id: string) {
    const address = await this.findByIdOrFail(id, ['children']);
    return address.children
  }
}
