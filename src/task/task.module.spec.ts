import { Test } from '@nestjs/testing';
import { TaskModule, taskRepoProvider } from './task.module';
import { JsonTaskRepository } from './repository/json-task-repository';
import { TaskRepository } from './repository/task-repository';
import { ConfigService } from '@nestjs/config';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ITask } from './interfaces/task.interface';

describe('TaskModule', () => {
  let mockTask: ITask;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockTask = {
      id: 'task-1',
      name: 'Test Task',
      dueDate: '2025-12-31T23:59:59Z',
      priority: 1,
      userId: 'user-1'
    };

    mockConfigService = {
      get: jest.fn()
    } as any;

    jest.clearAllMocks();
  });

  describe('Module Configuration', () => {
    it('should create a module with TaskController and TaskService', async () => {
      // Mock ConfigService to return 'json'
      jest.spyOn(mockConfigService, 'get').mockReturnValue('json');

      const moduleRef = await Test.createTestingModule({
        imports: [TaskModule]
      })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

      // Test module compilation
      expect(moduleRef).toBeDefined();

      // Test TaskController
      const controller = moduleRef.get(TaskController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(TaskController);

      // Test TaskService
      const service = moduleRef.get('ITaskService');
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TaskService);

      // Test Repository injection
      const repo = moduleRef.get('ITaskRepository');
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(JsonTaskRepository);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_MODE');
    });

    it('should use TaskRepository when DB_MODE is not json', async () => {
      // Mock ConfigService to return non-json value
      jest.spyOn(mockConfigService, 'get').mockReturnValue('postgres');

      const moduleRef = await Test.createTestingModule({
        imports: [TaskModule]
      })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

      const repo = moduleRef.get('ITaskRepository');
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(TaskRepository);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_MODE');
    });
  });

  describe('taskRepoProvider', () => {
    it('should correctly configure the provider', () => {
      const provider = taskRepoProvider as any;
      expect(provider.provide).toBe('ITaskRepository');
      expect(provider.inject).toEqual([ConfigService,'PG_POOL']);
    });

    describe('factory', () => {
      it('should return JsonTaskRepository when DB_MODE is json', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue('json');
        const repo = (taskRepoProvider as any).useFactory(mockConfigService);
        expect(repo).toBeInstanceOf(JsonTaskRepository);
      });

      it('should return TaskRepository when DB_MODE is not json', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue('postgres');
        const repo = (taskRepoProvider as any).useFactory(mockConfigService);
        expect(repo).toBeInstanceOf(TaskRepository);
      });

      it('should return TaskRepository when DB_MODE is undefined', () => {
        jest.spyOn(mockConfigService, 'get').mockReturnValue(undefined);
        const repo = (taskRepoProvider as any).useFactory(mockConfigService);
        expect(repo).toBeInstanceOf(TaskRepository);
      });
    });
  });
});
