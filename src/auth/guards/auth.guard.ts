import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JWT_SECRET } from 'src/common/constants';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import * as jwt from 'jsonwebtoken';

export class AuthGuard implements CanActivate {
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
      if (verified.user && verified.user.isActive) {
        request.user = verified.user;
        if (verified.user.expiryDate) {
          const expiry = new Date(verified.user.expiryDate);
          const today = new Date();
          return expiry > today;
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new HttpException('Token Invalid', HttpStatus.FORBIDDEN);
    }
  }
}
