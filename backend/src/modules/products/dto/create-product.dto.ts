import { IsString, MaxLength, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  basePrice: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isOnSale?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercentage?: number;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  cutOptionIds?: number[];
}
