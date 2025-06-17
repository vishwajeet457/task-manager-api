import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user-repository';
import { Pool } from 'pg';
import { IUser } from '../interfaces/user.interface';
import { v4 as uuid } from 'uuid';

// Mock UUID to return a fixed value for test consistency
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPool: Partial<Pool>;

  const mockUserRow = {
    id: 'user-1',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    password: 'hashedPassword123',
  };

  const expectedUser: IUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'PG_POOL',
          useValue: mockPool,
        },
        UserRepository,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUserRow] });

      const result = await repository.findByEmail('test@example.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        ['test@example.com']
      );
      expect(result).toEqual(expectedUser);
    });

    it('should return undefined when no user is found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByEmail('notfound@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUserRow] });

      const result = await repository.findById('user-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        ['user-1']
      );
      expect(result).toEqual(expectedUser);
    });

    it('should return undefined when no user is found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should insert a new user and return the created user', async () => {
      const userData: Omit<IUser, 'id'> = {
        email: 'new@example.com',
        password: 'securePass',
        firstName: 'Alice',
        lastName: 'Smith',
      };

      const expectedCreatedUser: IUser = {
        id: 'mock-uuid',
        ...userData,
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      const result = await repository.create(userData);

      expect(mockPool.query).toHaveBeenCalledWith(
        `INSERT INTO users (id, email, password, firstname, lastname)
       VALUES ($1, $2, $3, $4, $5)`,
        ['mock-uuid', 'new@example.com', 'securePass', 'Alice', 'Smith']
      );

      expect(result).toEqual(expectedCreatedUser);
    });
  });
});
