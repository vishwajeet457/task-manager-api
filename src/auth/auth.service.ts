import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupRequestDto } from './dto/request/signup.request.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUserService } from '../user/interfaces/user.service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserService') 
    private readonly usersService: IUserService,
    private jwtService: JwtService
  ) {}

  async signup(dto: SignupRequestDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password: hashed });

    return user;
  }

  async login(dto: LoginRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({ sub: user.id });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
