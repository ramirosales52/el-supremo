import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderGateway } from './order.gateway';

const SHIPPING_COST = 3500;
const FREE_SHIPPING_THRESHOLD = 50000;
const TRANSFER_DISCOUNT_RATE = 0.05;

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
    if (dto.idempotencyKey) {
      const existing = await this.repo.findOne({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: ['cutOptions'],
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const cutOptionIds = [
      ...new Set(dto.items.filter((i) => i.cutOptionId).map((i) => i.cutOptionId!)),
    ];
    const cutOptions =
      cutOptionIds.length > 0
        ? await this.cutOptionRepo.find({ where: { id: In(cutOptionIds) } })
        : [];
    const cutOptionMap = new Map(cutOptions.map((c) => [c.id, c]));

    const paymentMethod = dto.paymentMethod || 'cash';

    const orderItems: OrderItem[] = [];
    for (const itemDto of dto.items) {
      const product = productMap.get(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`Product #${itemDto.productId} not found`);
      }
      if (!product.isAvailable) {
        throw new BadRequestException(`Product "${product.name}" is not available`);
      }

      let unitPrice = Number(product.basePrice);

      if (product.isOnSale && product.discountPercentage && product.discountPercentage > 0) {
        unitPrice = unitPrice * (1 - product.discountPercentage / 100);
      }

      let cutOption: CutOption | null = null;
      if (itemDto.cutOptionId) {
        cutOption = cutOptionMap.get(itemDto.cutOptionId) ?? null;
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
      orderItems.push(orderItem);
    }

    let subtotal = 0;
    for (const item of orderItems) {
      subtotal += Number(item.unitPrice) * Number(item.quantity);
    }

    const discount =
      paymentMethod === 'transfer' ? subtotal * TRANSFER_DISCOUNT_RATE : 0;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal - discount + shippingCost;

    const order = this.repo.create() as Order;
    order.customerName = dto.customerName;
    order.customerPhone = dto.customerPhone;
    order.customerAddress = dto.customerAddress || null;
    order.paymentMethod = paymentMethod;
    order.paymentStatus = paymentMethod === 'cash' ? 'pending' : 'pending';
    order.subtotal = subtotal;
    order.discount = discount;
    order.shippingCost = shippingCost;
    order.total = total;
    order.notes = dto.notes || null;
    order.idempotencyKey = dto.idempotencyKey || null;
    order.items = orderItems;

    const saved = await this.repo.save(order);
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
