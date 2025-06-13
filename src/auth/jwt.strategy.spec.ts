import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { IUser } from '../user/interfaces/user.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: IUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword'
  };

  const mockPayload = {
    sub: mockUser.id,
    email: mockUser.email
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should properly initialize with config', () => {
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(strategy).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return user if valid payload', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findById.mockResolvedValue(undefined);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });
  });
});
