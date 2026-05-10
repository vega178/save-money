import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Mirrors JwtValidationFilter.doFilterInternal()
// Validates the Bearer token on every protected request
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  // Returned value is attached to request.user — equivalent to SecurityContextHolder
  async validate(payload: JwtPayload) {
    return {
      username: payload.sub,
      isAdmin: payload.isAdmin,
      roles: payload.authorities,
    };
  }
}
