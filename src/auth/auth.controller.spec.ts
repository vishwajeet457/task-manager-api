import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { SignupRequestDto } from './dto/request/signup.request.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { ResponseHelper } from '../common/response/response.helper';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser: UserResponseDto = {
    id: 'user-123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockLoginResponse: LoginResponseDto = {
    access_token: 'jwt.token.value',
    user: mockUser,
  };

  const authServiceMock = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).overrideGuard(JwtAuthGuard).useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser;
        return true;
      },
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());


  describe('signup', () => {
    it('should return BaseResponse<UserResponseDto> on success', async () => {
      authService.signup.mockResolvedValue({ ...mockUser, password: 'hashedpass' });

      const dto: SignupRequestDto = {
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: 'secure123',
      };

      const result = await controller.signup(dto);

      expect(authService.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(ResponseHelper.success('User created', mockUser));
    });

    it('should throw error if authService.signup fails', async () => {
      authService.signup.mockRejectedValueOnce(new Error('Signup failed'));

      const dto: SignupRequestDto = {
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: 'secure123',
      };

      await expect(controller.signup(dto)).rejects.toThrow('Signup failed');
    });
  });


  describe('login', () => {
    it('should return BaseResponse<LoginResponseDto> on success', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const dto: LoginRequestDto = {
        email: mockUser.email,
        password: 'secure123',
      };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(ResponseHelper.success('Login successful', mockLoginResponse));
    });

    it('should throw error if authService.login fails', async () => {
      authService.login.mockRejectedValueOnce(new Error('Login failed'));

      const dto: LoginRequestDto = {
        email: mockUser.email,
        password: 'wrong',
      };

      await expect(controller.login(dto)).rejects.toThrow('Login failed');
    });
  });


  describe('getMe', () => {
    it('should return current user (without password)', async () => {
      const result = await controller.getMe({ user: { ...mockUser, password: 'xyz' } });
      expect(result).toEqual(ResponseHelper.success('success', mockUser));
    });
  });
});
