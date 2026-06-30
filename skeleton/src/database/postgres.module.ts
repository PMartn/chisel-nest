import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/app-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'postgres',
        url: configService.databaseUrl,
        autoLoadEntities: true,
        synchronize: true, // TODO: Add option to toggle this
      }),
    }),
  ],
})
export class PostgresModule {}
