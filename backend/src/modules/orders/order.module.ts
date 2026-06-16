import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, CutOption])],
  controllers: [OrderController],
  providers: [OrderGateway, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
