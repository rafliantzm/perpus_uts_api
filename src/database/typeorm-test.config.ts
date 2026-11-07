import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Book } from '../modules/books/entities/book.entity.js';
import { Member } from '../modules/members/entities/member.entity.js';
import { Loan } from '../modules/loans/entities/loan.entity.js';

dotenv.config({ path: '.env.test', override: true });

export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'perpus_uts_test_db', // Explicitly fixed to perpus_uts_test_db
  entities: [Book, Member, Loan],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: false,
};

const TestAppDataSource = new DataSource(testDataSourceOptions);
export default TestAppDataSource;
