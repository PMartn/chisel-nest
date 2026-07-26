import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return parseInt(this.configService.get<string>('PORT') || '3000', 10);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get mongoUri(): string {
    const user = this.configService.get<string>('MONGO_ROOT_USER');
    const pass = this.configService.get<string>('MONGO_ROOT_PASSWORD');
    const host = this.configService.get<string>('MONGO_HOST');
    const port = this.configService.get<number>('MONGO_PORT');
    const db = this.configService.get<string>('MONGO_DB');

    return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
  }

  get isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
