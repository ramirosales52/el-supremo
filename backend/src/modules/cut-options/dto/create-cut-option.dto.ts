import { IsString, MaxLength, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCutOptionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceModifier?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  requiresNotes?: boolean;
}
