import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { dataSourceOptions } from './database/typeorm.config.js';
import { BooksModule } from './modules/books/books.module.js';
import { MembersModule } from './modules/members/members.module.js';
import { LoansModule } from './modules/loans/loans.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? ['.env.test', '.env'] : '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isTest = process.env.NODE_ENV === 'test';
        const dbName = isTest
          ? 'perpus_uts_test_db'
          : configService.get<string>('DB_NAME', 'perpus_uts_db');

        return {
          ...dataSourceOptions,
          database: dbName,
        } as TypeOrmModuleOptions;
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      exclude: ['/api/(.*)'],
    }),
    BooksModule,
    MembersModule,
    LoansModule,
    DashboardModule,
  ],
})
export class AppModule {}
