import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IUser } from './interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: IUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return undefined if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(undefined);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return undefined if user not found', async () => {
      userRepository.findById.mockResolvedValue(undefined);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeUndefined();
      expect(userRepository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const newUser: Omit<IUser, 'id'> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
      };

      const createdUser: IUser = {
        ...newUser,
        id: 'new-user-123',
      };

      userRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(newUser);

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(newUser);
    });
  });
});
