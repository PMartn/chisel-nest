import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get postgresUrl(): string {
    return this.configService.get<string>('POSTGRES_URL')!;
  }

  get port(): number {
    return parseInt(this.configService.get<string>('PORT') || '3000', 10);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get mongoUri(): string {
    return this.configService.get<string>('MONGO_URI')!;
  }

  get isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
