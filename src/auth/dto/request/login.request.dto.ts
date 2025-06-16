import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength,IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
 
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
