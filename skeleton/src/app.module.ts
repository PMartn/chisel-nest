import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PostgresModule } from './database/postgres.module';
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [AppConfigModule, PostgresModule, MongoModule],
})
export class AppModule {}
