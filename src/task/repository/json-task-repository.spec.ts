import { JsonTaskRepository } from './json-task-repository';
import { ITask } from '../interfaces/task.interface';
import { promises as fs } from 'fs';
import * as path from 'path';

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined),
  }
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1')
}));

describe('JsonTaskRepository', () => {
  let repository: JsonTaskRepository;
  const mockTask: ITask = {
    id: 'task-1',
    name: 'Test Task',
    dueDate: '2025-12-31T23:59:59Z',
    priority: 1,
    userId: 'user-1'
  };

  beforeEach(() => {
    repository = new JsonTaskRepository();
    jest.clearAllMocks();
    // Default mock implementations
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
  });

  describe('create', () => {
    it('should create a new task with generated id', async () => {
      const taskData: Omit<ITask, 'id'> = {
        name: 'New Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 2,
        userId: 'user-1'
      };
      
      const result = await repository.create(taskData as ITask);
      const expectedTask = { ...taskData, id: 'test-uuid-1' };

      expect(result).toEqual(expectedTask);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse((fs.writeFile as jest.Mock).mock.calls[0][1]);
      expect(writtenData).toEqual([expectedTask]);
    });

    it('should append task to existing tasks', async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([mockTask]));

      const taskData: Omit<ITask, 'id'> = {
        name: 'New Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 3,
        userId: 'user-1'
      };

      const result = await repository.create(taskData as ITask);
      const expectedTask = { ...taskData, id: 'test-uuid-1' };

      expect(result).toEqual(expectedTask);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse((fs.writeFile as jest.Mock).mock.calls[0][1]);
      expect(writtenData).toEqual([mockTask, expectedTask]);
    });
  });

  describe('update', () => {
    it('should update existing task', async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([mockTask]));

      const updates: Partial<ITask> = {
        name: 'Updated Task',
        priority: 5
      };

      const result = await repository.update(mockTask.id, updates);
      const expectedTask = { ...mockTask, ...updates };

      expect(result).toEqual(expectedTask);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse((fs.writeFile as jest.Mock).mock.calls[0][1]);
      expect(writtenData).toEqual([expectedTask]);
    });

    it('should return null if task not found', async () => {
      const result = await repository.update('non-existent', { name: 'Updated' });

      expect(result).toBeNull();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing task', async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([mockTask]));

      await repository.delete(mockTask.id);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse((fs.writeFile as jest.Mock).mock.calls[0][1]);
      expect(writtenData).toEqual([]);
    });

    it('should not fail if task does not exist', async () => {
      await repository.delete('non-existent');
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse((fs.writeFile as jest.Mock).mock.calls[0][1]);
      expect(writtenData).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return task if found', async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([mockTask]));

      const result = await repository.findById(mockTask.id);

      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return all tasks for user', async () => {
      const userTasks = [
        mockTask,
        { ...mockTask, id: 'task-2', name: 'Another Task' }
      ];
      const otherUserTask = { ...mockTask, id: 'task-3', userId: 'other-user' };
      
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([...userTasks, otherUserTask])
      );

      const result = await repository.findByUser(mockTask.userId);

      expect(result).toEqual(userTasks);
    });

    it('should return empty array if no tasks found', async () => {
      const result = await repository.findByUser('any-user');

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should return empty array when reading non-existent file', async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

      const result = await repository.findByUser('any-user');

      expect(result).toEqual([]);
    });

    it('should handle JSON parse errors', async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce('invalid json');

      const result = await repository.findByUser('any-user');

      expect(result).toEqual([]);
    });
  });
});
