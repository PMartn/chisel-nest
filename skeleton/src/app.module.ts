import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PostgresModule } from './database/postgres.module';
import { MongoModule } from './database/mongo.module';
import { LoggerModule } from 'pino-nestjs';
import { AppConfigService } from './config/app-config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    AppConfigModule,
    PostgresModule,
    MongoModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => ({
        pinoHttp: {
          transport: config.isDevelopment
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        },
      }),
    }),
  ],
})
export class AppModule {}
