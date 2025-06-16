import { Test } from '@nestjs/testing';
import { UserModule, userRepoProvider } from './user.module';
import { JsonUserRepository } from './repositories/json-user-repository';
import { UserRepository } from './repositories/user-repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IUserService } from './interfaces/user.service.interface';
import { IUser } from './interfaces/user.interface';
import { UserService } from './user.service';
import { Pool } from 'pg';

describe('UserModule', () => {
  let mockUser: IUser;
  let mockConfigService: ConfigService;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword123'
    };

    mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  } as any;

    mockConfigService = {
      get: jest.fn()
    } as any;

    jest.clearAllMocks();
  });

  describe('Module Configuration', () => {    it('should create a module with UserService and proper repository', async () => {
      // Mock ConfigService to return 'json'
      jest.spyOn(mockConfigService, 'get').mockReturnValue('json');

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true
          }),
          UserModule
        ],
      })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

      // Test module compilation
      expect(moduleRef).toBeDefined();

      // Test UserService
      const service = moduleRef.get('IUserService');
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(UserService);

      // Test Repository injection
      const repo = moduleRef.get('IUserRepository');
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(JsonUserRepository);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_MODE');
    });    it('should use UserRepository when DB_MODE is not json', async () => {
      // Mock ConfigService to return non-json value
      jest.spyOn(mockConfigService, 'get').mockReturnValue('postgres');

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true
          }),
          UserModule
        ],
      })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

      const repo = moduleRef.get('IUserRepository');
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(UserRepository);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_MODE');
    });    it('should export UserService', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValue('json');

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true
          }),
          UserModule
        ],
      })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

      const service = moduleRef.get('IUserService');
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(UserService);
    });
  });

  describe('userRepoProvider', () => {
    it('should correctly configure the provider', () => {
      const provider = userRepoProvider as any;
      expect(provider.provide).toBe('IUserRepository');
      expect(provider.inject).toEqual([ConfigService,'PG_POOL']);
    });

    describe('factory', () => {
      it('should return JsonUserRepository when DB_MODE is json', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue('json');
        const repo = (userRepoProvider as any).useFactory(mockConfigService,mockPool);
        expect(repo).toBeInstanceOf(JsonUserRepository);
      });

      it('should return UserRepository when DB_MODE is not json', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue('postgres');
        const repo = (userRepoProvider as any).useFactory(mockConfigService, mockPool);
        expect(repo).toBeInstanceOf(UserRepository);
      });      
      
      it('should return UserRepository when DB_MODE is undefined', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue(undefined);
        const repo = (userRepoProvider as any).useFactory(mockConfigService,mockPool);
        expect(repo).toBeInstanceOf(UserRepository);
        expect(mockConfigService.get).toHaveBeenCalledWith('DB_MODE');
      });
    });
  });
});
