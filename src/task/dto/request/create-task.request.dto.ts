import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateTaskRequestDto {
  
  
  @IsString() 
  @ApiProperty()
  name: string;

  @IsDateString() 
  @ApiProperty()
  dueDate: string;
  
  @IsInt() 
  @ApiProperty()
  priority: number;
}
