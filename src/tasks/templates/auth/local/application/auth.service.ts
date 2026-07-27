import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../users/domain/ports/user-repository.port';
import { User } from '../../users/domain/models/user.model';
import { Role } from '../domain/role.enum';

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
  ): Promise<{ accessToken: string }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create({ email, name, passwordHash, roles: [Role.USER] });
    const saved = await this.users.save(user);
    return this.issueToken(saved);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return { accessToken: await this.jwt.signAsync(payload) };
  }
}
