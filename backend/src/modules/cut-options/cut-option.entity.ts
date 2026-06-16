import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('cut_options')
export class CutOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceModifier: number | null;

  @Column({ default: false })
  requiresNotes: boolean;

  @ManyToMany(() => Product, (product) => product.cutOptions)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
