import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login', description: 'Authenticates with username/password and returns a signed JWT Bearer token.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — returns token, username and a message.', schema: { example: { token: 'eyJ...', username: 'vega178', message: 'Hey vega178 you just signed in successfully' } } })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() _dto: LoginDto) {
    return this.authService.login(req.user);
  }
}

