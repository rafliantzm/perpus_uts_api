import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Book } from '../modules/books/entities/book.entity.js';
import { Member } from '../modules/members/entities/member.entity.js';
import { Loan } from '../modules/loans/entities/loan.entity.js';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test', override: true });
} else {
  dotenv.config();
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.NODE_ENV === 'test' ? (process.env.DB_NAME || 'perpus_uts_test_db') : (process.env.DB_NAME || 'perpus_uts_db'),
  entities: [Book, Member, Loan],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
