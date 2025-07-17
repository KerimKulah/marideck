import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { CustomerModule } from './customer/customer.module';
import { ShipModule } from './ship/ship.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Serve static files from public directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'images'),
      serveRoot: '/images',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        },
      },
    }),

    // Modules  
    AuthModule, CustomerModule, ShipModule,

    // Configs etc.
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    // TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error', 'warn'],
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
  ]
})
export class AppModule {
  constructor(private readonly dataSource: DataSource) {
    addTransactionalDataSource(this.dataSource);
    initializeTransactionalContext();
  }
}
