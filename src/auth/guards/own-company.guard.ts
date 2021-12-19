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

@Injectable()
export class OwnCompanyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) return false;
    const token = authorization.split(' ')[1];
    if (!token) 
      return false;    

    try {
      const params = request.params;
      const company_id = params.company_id;

      const verified: any = jwt.verify(token, JWT_SECRET);

      //TODO: check if user expired     
      if (verified.user?.company_id == company_id && verified.user?.isActive) {
        request.user = verified.user;        
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
