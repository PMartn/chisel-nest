import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationPort } from '../../application/ports/authentication.port';
import { AuthenticatedUser } from '../../domain/authenticated-user';
import { Role } from '../../domain/role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
}

@Injectable()
export class LocalAuthenticationAdapter implements AuthenticationPort {
  constructor(private readonly jwt: JwtService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    const payload = await this.jwt.verifyAsync<JwtPayload>(token);
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
