import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user-repository';
import { IUser } from '../interfaces/user.interface';

describe('UserRepository', () => {
  let repository: UserRepository;

  const mockUserData: Omit<IUser, 'id'> = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should throw Not Implemented error', async () => {
      await expect(repository.findByEmail('test@example.com'))
        .rejects
        .toThrow('Method not implemented.');
    });
  });

  describe('findById', () => {
    it('should throw Not Implemented error', async () => {
      await expect(repository.findById('some-id'))
        .rejects
        .toThrow('Method not implemented.');
    });
  });

  describe('create', () => {
    it('should throw Not Implemented error', async () => {
      await expect(repository.create(mockUserData))
        .rejects
        .toThrow('Method not implemented.');
    });
  });
});
