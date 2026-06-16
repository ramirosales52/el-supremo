import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CutOptionService } from './cut-option.service';
import { CreateCutOptionDto } from './dto/create-cut-option.dto';
import { UpdateCutOptionDto } from './dto/update-cut-option.dto';

@Controller('cut-options')
export class CutOptionController {
  constructor(private readonly service: CutOptionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCutOptionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCutOptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
