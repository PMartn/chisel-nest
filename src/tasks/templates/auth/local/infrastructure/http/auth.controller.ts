import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import type { AuthenticatedUser } from '../../domain/authenticated-user';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginRequestDto } from './dto/login.dto';
import { RegisterRequestDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterRequestDto): Promise<{ accessToken: string }> {
    return this.authService.register(dto.email, dto.name, dto.password);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginRequestDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
