import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  customerName: string;

  @Column({ length: 50 })
  customerPhone: string;

  @Column({ length: 300, nullable: true })
  customerAddress: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 20, default: 'cash' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ length: 255, nullable: true, unique: true })
  idempotencyKey: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
