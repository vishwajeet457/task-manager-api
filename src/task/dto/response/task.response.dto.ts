import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  dueDate: string;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  userId: string;
}
