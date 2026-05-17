import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, jwtConfig } from './config/env.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BillsModule } from './bills/bills.module';
import { BirthdaysModule } from './birthdays/birthdays.module';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Bill } from './bills/entities/bill.entity';
import { Birthday } from './birthdays/entities/birthday.entity';
import { DatabaseSeeder } from './database/database.seeder';

@Module({
  imports: [
    // Load .env file — mirrors @Value("${...}") and application.properties
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // TypeORM setup — mirrors Spring Data JPA / application.properties
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [User, Role, Bill, Birthday],
        synchronize: true, // equivalent to ddl-auto=update — disable in production
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),

    UsersModule,
    AuthModule,
    BillsModule,
    BirthdaysModule,
    // Register entity repos needed by seeder
    TypeOrmModule.forFeature([User, Role, Bill, Birthday]),
  ],
  providers: [DatabaseSeeder],
})
export class AppModule {}
