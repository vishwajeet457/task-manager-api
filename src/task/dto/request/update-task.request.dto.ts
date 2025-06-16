import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateTaskRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  id:string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  name?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  priority?: number;
}
