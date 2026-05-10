import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Activates the JWT strategy — equivalent to @authenticated() in Spring Security.
// Add @UseGuards(JwtAuthGuard) to any route that requires a valid Bearer token.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
