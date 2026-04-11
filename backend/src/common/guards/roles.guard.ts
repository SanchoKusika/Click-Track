import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { Request } from 'express';

type RolesRequest = Request & {
  user?: {
    role?: string;
  };
};

function isRole(value: string | undefined): value is Role {
  return value === Role.ADMIN || value === Role.MENTOR || value === Role.INTERN;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RolesRequest>();
    const role = request.user?.role;
    if (!isRole(role)) {
      return false;
    }

    return requiredRoles.includes(role);
  }
}
