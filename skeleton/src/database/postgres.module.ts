import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      // Apply any pending migrations on startup
      migrationsRun: true,
    }),
  ],
})
export class PostgresModule {}
