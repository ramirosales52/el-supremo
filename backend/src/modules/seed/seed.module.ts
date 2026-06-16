import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, CutOption])],
  providers: [SeedService],
})
export class SeedModule {}
