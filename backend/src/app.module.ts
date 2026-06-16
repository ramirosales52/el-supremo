import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './modules/categories/category.module';
import { CutOptionModule } from './modules/cut-options/cut-option.module';
import { ProductModule } from './modules/products/product.module';
import { OrderModule } from './modules/orders/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'elsupremo',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CategoryModule,
    CutOptionModule,
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
