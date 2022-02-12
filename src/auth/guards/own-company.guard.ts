import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'src/common/constants';
import { employeeValid } from 'src/common/utils/functions';
import { User } from 'src/users/user.entity';

@Injectable()
export class OwnCompanyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) return false;
    const token = authorization.split(' ')[1];
    if (!token) return false;
    try {
      const params = request.params;
      const company_id = params.company_id;
      if (!company_id) return false;
      const verified: any = jwt.verify(token, JWT_SECRET);
      const user: User = verified.user;
      if (
        user.company_id == company_id &&
        user.isActive &&
        employeeValid(user.expiryDate, user.isActive, user.role)
      ) {
        request.user = user;
        return true;
      } else {
        throw new BadRequestException(
          "You don't have permission to perform this action",
        );
        return false;
      }
    } catch (err) {
      throw new HttpException('Token Invalid', HttpStatus.FORBIDDEN);
    }
  }
}
