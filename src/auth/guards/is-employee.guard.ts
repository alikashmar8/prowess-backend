import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'src/common/constants';
import { employeeValid } from 'src/common/utils/functions';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';

export class IsEmployeeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) return false;
    const token = authorization.split(' ')[1];

    if (!token) {
      return false;
    }
    try {
      const verified: any = jwt.verify(token, JWT_SECRET);
      let user: User = verified.user;


      if (
        user.role != 'CUSTOMER' &&
        !user.isSuperAdmin &&
        user.company_id &&
        employeeValid(user.expiryDate, user.isActive, user.role)
      ) {
        request.user = user;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new HttpException('Token Invalid', HttpStatus.FORBIDDEN);
    }
  }
}
