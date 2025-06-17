import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/request/signup.request.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { JwtAuthGuard } from './jwt.guard';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ResponseHelper } from '../common/response/response.helper';
import { ApiBaseResponse } from '../common/decorators/api-base-response.decorator';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { BaseResponse } from '../common/response/base-response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(200)
  @ApiBody({ type: SignupRequestDto })
  @ApiBaseResponse(UserResponseDto, 'Successfully created user')
  async signup(@Body() dto: SignupRequestDto) : Promise<BaseResponse<UserResponseDto>> {
    const response =  await this.authService.signup(dto);
    const { password, ...safeUser } = response;
    return ResponseHelper.success<UserResponseDto>('User created', safeUser);
   
  }

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginRequestDto })
  @ApiBaseResponse(LoginResponseDto, 'Login successful')
  async login(@Body() dto: LoginRequestDto) : Promise<BaseResponse<LoginResponseDto>> {
    const response =  await this.authService.login(dto);
    return ResponseHelper.success<LoginResponseDto>('Login successful', response);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiBaseResponse(UserResponseDto, 'User details retrieved successfully')
  async getMe(@Req() req) : Promise<BaseResponse<UserResponseDto>>  { 
    const { password, ...safeUser } = req.user;
     return ResponseHelper.success<UserResponseDto>('success', safeUser);
  }
}
