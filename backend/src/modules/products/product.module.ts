import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CutOption])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
