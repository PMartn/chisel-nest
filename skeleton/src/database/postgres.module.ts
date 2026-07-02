import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/app-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'postgres',
        url: configService.postgresUrl,
        autoLoadEntities: true,
        synchronize: configService.isDevelopment,
        logging: configService.isDevelopment,
      }),
    }),
  ],
})
export class PostgresModule {}
