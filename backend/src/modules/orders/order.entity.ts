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
  customerAddress: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
