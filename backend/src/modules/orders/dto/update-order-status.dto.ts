import { IsString, IsIn } from 'class-validator';

const validStatuses = ['pending', 'preparing', 'ready', 'delivered'] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(validStatuses)
  status: typeof validStatuses[number];
}
