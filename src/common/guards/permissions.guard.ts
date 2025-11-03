import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Get all permissions from user's roles
    const userPermissions = new Set<string>();

    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((userRole: any) => {
        if (userRole.role && userRole.role.permissions) {
          userRole.role.permissions.forEach((rolePermission: any) => {
            if (rolePermission.permission) {
              const permissionName = `${rolePermission.permission.resource}:${rolePermission.permission.action}`;
              userPermissions.add(permissionName);
            }
          });
        }
      });
    }

    // Check if user has all required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );
  }
}
