import { TaskRepository } from './task-repository';
import { Pool } from 'pg';
import { ITask } from '../interfaces/task.interface';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockPool: Partial<Pool>;

  const mockTask: ITask = {
    id: 'task-1',
    name: 'Test Task',
    dueDate: '2025-06-20',
    priority: 1,
    userId: 'user-1',
  };

  const mockdbTask = {
    id: mockTask.id,
    name: mockTask.name,
    duedate: mockTask.dueDate,
    priority: mockTask.priority,
    userid: mockTask.userId,
  };

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };

    repository = new TaskRepository(mockPool as Pool);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return a task', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockdbTask] });

      const inputTask: ITask = { ...mockTask, id: '' }; // ID will be generated
      const result = await repository.create(inputTask);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        ['mock-uuid', inputTask.name, inputTask.dueDate, inputTask.priority, inputTask.userId]
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update and return a task', async () => {
      const updates = { name: 'Updated Task', priority: 2 };
      const expectedQuery = expect.stringContaining('UPDATE tasks');
      const expectedValues = ['Updated Task', 2, mockTask.id];

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1, rows: [mockdbTask] });

      const result = await repository.update(mockTask.id, updates);

      expect(mockPool.query).toHaveBeenCalledWith(expectedQuery, expectedValues);
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await repository.update('non-existent', { name: 'x' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call delete query with correct id', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      await repository.delete(mockTask.id);
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM tasks WHERE id = $1',
        [mockTask.id]
      );
    });
  });

  describe('findById', () => {
    it('should return a task when found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1, rows: [{
        id: mockTask.id,
        name: mockTask.name,
        duedate: mockTask.dueDate,
        priority: mockTask.priority,
        userid: mockTask.userId,
      }] });

      const result = await repository.findById(mockTask.id);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = $1',
        [mockTask.id]
      );
      expect(result).toEqual(mockTask);
    });

    it('should return null when not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await repository.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {    it('should return list of tasks for user', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 'task-1', name: 'Task 1', duedate: '2025-06-16', priority: 1, userid: 'user-1' },
          { id: 'task-2', name: 'Task 2', duedate: '2025-06-17', priority: 2, userid: 'user-1' },
        ]
      });      const result = await repository.findByUser('user-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, TO_CHAR(duedate, 'YYYY-MM-DD') AS duedate, priority,userid"),
        ['user-1']
      );

      expect(result.length).toBe(2);
      expect(result).toEqual([
        { id: 'task-1', name: 'Task 1', dueDate: '2025-06-16', priority: 1, userId: 'user-1' },
        { id: 'task-2', name: 'Task 2', dueDate: '2025-06-17', priority: 2, userId: 'user-1' }
      ]);
    });
  });
});
