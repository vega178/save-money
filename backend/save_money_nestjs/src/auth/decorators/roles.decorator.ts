import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Usage: @Roles('ROLE_ADMIN') or @Roles('ROLE_USER', 'ROLE_ADMIN')
// Mirrors .hasRole('ADMIN') / .hasAnyRole('USER','ADMIN') in SpringSecurityConfig
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
