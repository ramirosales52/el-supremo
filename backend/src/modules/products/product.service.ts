import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(CutOption)
    private readonly cutOptionRepo: Repository<CutOption>,
  ) {}

  findAll(categoryId?: number): Promise<Product[]> {
    const where: any = { isAvailable: true };
    if (categoryId) where.categoryId = categoryId;
    return this.repo.find({
      where,
      relations: ['category', 'cutOptions'],
      order: { name: 'ASC' },
    });
  }

  findAllAdmin(): Promise<Product[]> {
    return this.repo.find({
      relations: ['category', 'cutOptions'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['category', 'cutOptions'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { cutOptionIds, ...data } = dto;
    const product = this.repo.create(data);

    if (cutOptionIds?.length) {
      product.cutOptions = await this.cutOptionRepo.findByIds(cutOptionIds);
    }

    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const { cutOptionIds, ...data } = dto;
    const product = await this.findOne(id);
    Object.assign(product, data);

    if (cutOptionIds !== undefined) {
      product.cutOptions = cutOptionIds.length
        ? await this.cutOptionRepo.findByIds(cutOptionIds)
        : [];
    }

    return this.repo.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Product #${id} not found`);
  }
}
