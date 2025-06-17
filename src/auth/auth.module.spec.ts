import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';

describe('AuthModule', () => {  let moduleRef: any;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: JwtService;
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;

  const mockConfigService = {
    get: jest.fn()
  } as any as jest.Mocked<ConfigService>;

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  } as any as jest.Mocked<UserService>;
  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up mock values
    mockConfigService.get.mockReturnValue('test-jwt-secret');

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          useFactory: (config: ConfigService) => ({
            secret: config.get('JWT_SECRET'),
            signOptions: { },
          }),
          inject: [ConfigService],
        }),
        UserModule
      ],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ],
      controllers: [AuthController],
    }).compile();

    // Get service instances
    configService = moduleRef.get(ConfigService);
    jwtService = moduleRef.get(JwtService);
    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
  });

  it('should compile the module', () => {
    expect(moduleRef).toBeDefined();
  });

  describe('Module configuration', () => {
    it('should provide AuthService', () => {
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should provide AuthController', () => {      const controller = moduleRef.get(AuthController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });

    it('should provide JwtStrategy', () => {
      const strategy = moduleRef.get(JwtStrategy);
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('should provide JWT configuration', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService).toBeDefined();
      expect(typeof jwtService.signAsync).toBe('function');
    });
  });

  describe('Dependencies', () => {
    it('should inject UserService', () => {
      expect(userService).toBeDefined();
      expect(userService.findByEmail).toBeDefined();
      expect(userService.findById).toBeDefined();
      expect(userService.create).toBeDefined();
    });

    it('should inject JwtService', () => {
      expect(jwtService).toBeDefined();
      expect(typeof jwtService.signAsync).toBe('function');
    });

    it('should inject ConfigService', () => {
      expect(configService).toBeDefined();
      expect(configService.get).toBeDefined();
    });
  });

  describe('JWT Configuration', () => {
    it('should configure JWT with correct secret', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      // We can verify the secret was used through the mock
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(mockConfigService.get).toHaveReturnedWith('test-jwt-secret');
    });

    it('should set up JWT strategy correctly', () => {
      const strategy = moduleRef.get(JwtStrategy);
      expect(strategy).toBeDefined();
      // The strategy configuration is private, but we can verify it exists
      expect(strategy.validate).toBeDefined();
      expect(typeof strategy.validate).toBe('function');
    });
  });
});
