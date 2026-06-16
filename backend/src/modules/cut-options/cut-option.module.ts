import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutOption } from './cut-option.entity';
import { CutOptionController } from './cut-option.controller';
import { CutOptionService } from './cut-option.service';

@Module({
  imports: [TypeOrmModule.forFeature([CutOption])],
  controllers: [CutOptionController],
  providers: [CutOptionService],
  exports: [CutOptionService],
})
export class CutOptionModule {}
