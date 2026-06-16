import { IsString, MaxLength, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cutOptionId?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @IsString()
  @MaxLength(200)
  customerName: string;

  @IsString()
  @MaxLength(50)
  customerPhone: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  customerAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
