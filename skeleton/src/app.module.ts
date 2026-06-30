import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, MongoModule],
})
export class AppModule {}
