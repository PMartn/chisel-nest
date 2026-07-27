import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../users/domain/ports/user-repository.port';
import { User } from '../../users/domain/models/user.model';
import { Role } from '../domain/role.enum';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(
    email: string,
    name: string,
    password: string,
  ): Promise<AuthTokens> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create({ email, name, passwordHash, roles: [Role.USER] });
    return this.issueTokens(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(
        refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findById(sub);
    if (
      !user ||
      !user.hashedRefreshToken ||
      !(await bcrypt.compare(refreshToken, user.hashedRefreshToken))
    ) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (user) {
      await this.users.save(user.withHashedRefreshToken(null));
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
          '7d') as JwtSignOptions['expiresIn'],
      },
    );
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.users.save(user.withHashedRefreshToken(hashedRefreshToken));
    return { accessToken, refreshToken };
  }
}
