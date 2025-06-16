import { IsOptional, IsString, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateTaskRequestDto {
  @IsNotEmpty()
  id:string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
