import { Test, TestingModule } from '@nestjs/testing';
import { JsonUserRepository } from './json-user-repository';
import { IUser } from '../interfaces/user.interface';
import * as fs from 'fs-extra';
import * as path from 'path';

jest.mock('fs-extra');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1')
}));

describe('JsonUserRepository', () => {
  let repository: JsonUserRepository;
  const testDbPath = path.join(process.cwd(), 'data', 'users.json');

  const mockUser: IUser = {
    id: 'existing-user-id', // Changed to distinguish from new users
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonUserRepository],
    }).compile();

    repository = module.get<JsonUserRepository>(JsonUserRepository);
    
    // Reset all mock implementations
    jest.clearAllMocks();
    
    // Default mock implementations
    (fs.pathExists as jest.Mock).mockResolvedValue(true);
    (fs.readJson as jest.Mock).mockResolvedValue([]);
    (fs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (fs.outputJson as jest.Mock).mockResolvedValue(undefined);
  });

  describe('constructor', () => {
    it('should ensure file exists on initialization', async () => {
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(false);

      // Create new instance to trigger constructor
      new JsonUserRepository();
      
      expect(fs.pathExists).toHaveBeenCalledWith(testDbPath);
      // Wait for the ensureFile promise to resolve
      await new Promise(process.nextTick);
      expect(fs.outputJson).toHaveBeenCalledWith(testDbPath, []);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      (fs.readJson as jest.Mock).mockResolvedValueOnce([mockUser]);

      const result = await repository.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(fs.readJson).toHaveBeenCalledWith(testDbPath);
    });

    it('should return undefined if user not found', async () => {
      (fs.readJson as jest.Mock).mockResolvedValueOnce([mockUser]);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
      expect(fs.readJson).toHaveBeenCalledWith(testDbPath);
    });

    it('should create file if it does not exist', async () => {
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(false);

      await repository.findByEmail(mockUser.email);

      expect(fs.writeJson).toHaveBeenCalledWith(testDbPath, []);
      expect(fs.readJson).toHaveBeenCalledWith(testDbPath);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      (fs.readJson as jest.Mock).mockResolvedValueOnce([mockUser]);

      const result = await repository.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(fs.readJson).toHaveBeenCalledWith(testDbPath);
    });

    it('should return undefined if user not found', async () => {
      (fs.readJson as jest.Mock).mockResolvedValueOnce([mockUser]);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeUndefined();
      expect(fs.readJson).toHaveBeenCalledWith(testDbPath);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const existingUsers: IUser[] = [];
      (fs.readJson as jest.Mock).mockResolvedValueOnce(existingUsers);

      const newUserData: Omit<IUser, 'id'> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      };

      const result = await repository.create(newUserData);
      const expectedUser = { id: 'test-uuid-1', ...newUserData };

      expect(result).toEqual(expectedUser);
      expect(fs.writeJson).toHaveBeenCalledWith(
        testDbPath,
        [expectedUser],
        { spaces: 2 }
      );
    });

    it('should append new user to existing users', async () => {
      const existingUsers: IUser[] = [mockUser]; // Using mockUser with different ID
      (fs.readJson as jest.Mock).mockResolvedValueOnce(existingUsers);

      const newUserData: Omit<IUser, 'id'> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      };

      const result = await repository.create(newUserData);
      const expectedUser = { id: 'test-uuid-1', ...newUserData };

      expect(result).toEqual(expectedUser);
      expect(fs.writeJson).toHaveBeenCalledWith(
        testDbPath,
        [mockUser, expectedUser], // Order matters here - existing user first, then new user
        { spaces: 2 }
      );
    });
  });
});
