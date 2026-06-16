import { PartialType } from '@nestjs/mapped-types';
import { CreateCutOptionDto } from './create-cut-option.dto';

export class UpdateCutOptionDto extends PartialType(CreateCutOptionDto) {}
