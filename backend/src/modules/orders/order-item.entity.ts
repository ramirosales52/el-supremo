import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { CutOption } from '../cut-options/cut-option.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @ManyToOne(() => CutOption, { eager: true, nullable: true })
  @JoinColumn({ name: 'cutOptionId' })
  cutOption: CutOption | null;

  @Column({ nullable: true })
  cutOptionId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ length: 10 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
