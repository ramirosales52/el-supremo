import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CutOption } from './cut-option.entity';
import { CreateCutOptionDto } from './dto/create-cut-option.dto';
import { UpdateCutOptionDto } from './dto/update-cut-option.dto';

@Injectable()
export class CutOptionService {
  constructor(
    @InjectRepository(CutOption)
    private readonly repo: Repository<CutOption>,
  ) {}

  findAll(): Promise<CutOption[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<CutOption> {
    const option = await this.repo.findOne({ where: { id } });
    if (!option) throw new NotFoundException(`CutOption #${id} not found`);
    return option;
  }

  create(dto: CreateCutOptionDto): Promise<CutOption> {
    const option = this.repo.create(dto);
    return this.repo.save(option);
  }

  async update(id: number, dto: UpdateCutOptionDto): Promise<CutOption> {
    const option = await this.findOne(id);
    Object.assign(option, dto);
    return this.repo.save(option);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`CutOption #${id} not found`);
  }
}
