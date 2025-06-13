import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUser } from '../user/interfaces/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: IUser = {
    id: 'user-123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedpass123',
  };

  const signupDto = {
    email: mockUser.email,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    password: 'plaintextpass',
  };

  const loginDto = {
    email: mockUser.email,
    password: 'plaintextpass',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('signup', () => {
    it('should create a new user if email is unique', async () => {
      userService.findByEmail.mockResolvedValue(undefined);
      userService.create.mockResolvedValue({ ...mockUser });

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedpass123');

      const result = await service.signup(signupDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(signupDto.email);
      expect(userService.create).toHaveBeenCalledWith({
        ...signupDto,
        password: 'hashedpass123',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access_token and user on successful login', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValue('jwt.token.value');

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual({
        access_token: 'jwt.token.value',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('should throw BadRequestException if user not found', async () => {
      userService.findByEmail.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });
});
