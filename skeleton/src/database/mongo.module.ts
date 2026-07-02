import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/app-config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.mongoUri,
        autoIndex: configService.isDevelopment,
      }),
    }),
  ],
})
export class MongoModule {}
