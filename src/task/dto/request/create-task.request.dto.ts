import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateTaskRequestDto {
  @IsString() name: string;
  @IsDateString() dueDate: string;
  @IsInt() priority: number;
}
