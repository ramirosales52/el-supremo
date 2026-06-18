import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { OrderItem } from '../orders/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ length: 10, default: 'kg' })
  unit: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isOnSale: boolean;

  @Column({ type: 'int', nullable: true })
  discountPercentage: number;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @ManyToMany(() => CutOption, (cutOption) => cutOption.products, { eager: true })
  @JoinTable({
    name: 'products_cut_options',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cutOptionId', referencedColumnName: 'id' },
  })
  cutOptions: CutOption[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
