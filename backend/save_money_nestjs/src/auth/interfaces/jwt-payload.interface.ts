// Mirrors the claims structure built in JwtAuthenticationFilter.successfulAuthentication()
export interface JwtPayload {
  sub: string;           // username
  isAdmin: boolean;
  authorities: string[]; // e.g. ['ROLE_USER', 'ROLE_ADMIN']
  iat?: number;
  exp?: number;
}
