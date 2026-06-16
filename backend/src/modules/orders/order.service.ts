import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CutOption)
    private readonly cutOptionRepo: Repository<CutOption>,
    private readonly orderGateway: OrderGateway,
  ) {}

  findAll(status?: string): Promise<Order[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const items: OrderItem[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOne({
        where: { id: itemDto.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product #${itemDto.productId} not found`);
      }

      let unitPrice = Number(product.basePrice);
      let cutOption: CutOption | null = null;

      if (itemDto.cutOptionId) {
        cutOption = await this.cutOptionRepo.findOne({
          where: { id: itemDto.cutOptionId },
        });
        if (cutOption?.priceModifier) {
          unitPrice += Number(cutOption.priceModifier);
        }
      }

      const orderItem = new OrderItem();
      orderItem.productId = itemDto.productId;
      orderItem.product = product;
      orderItem.cutOptionId = itemDto.cutOptionId ?? null;
      orderItem.cutOption = cutOption;
      orderItem.quantity = itemDto.quantity;
      orderItem.unit = itemDto.unit || product.unit;
      orderItem.unitPrice = unitPrice;
      orderItem.notes = itemDto.notes ?? null;
      items.push(orderItem);
    }

    const order = this.repo.create({
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerAddress: dto.customerAddress || null,
      notes: dto.notes || null,
      items,
    } as any);

    const saved = await this.repo.save(order) as unknown as Order;
    this.orderGateway.notifyNewOrder(saved);
    return saved;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    const saved = await this.repo.save(order);
    this.orderGateway.notifyStatusChange(saved);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Order #${id} not found`);
  }
}
