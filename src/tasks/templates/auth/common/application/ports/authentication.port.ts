import { AuthenticatedUser } from '../../domain/authenticated-user';

export abstract class AuthenticationPort {
  abstract verify(token: string): Promise<AuthenticatedUser>;
}
