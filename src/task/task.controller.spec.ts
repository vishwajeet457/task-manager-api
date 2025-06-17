import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { ITaskService } from './interfaces/task-service.interface';
import { CreateTaskRequestDto } from './dto/request/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/request/update-task.request.dto';
import { ITask } from './interfaces/task.interface';
import { ResponseHelper } from '../common/response/response.helper';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: jest.Mocked<ITaskService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockTask: ITask = {
    id: 'task-123',
    name: 'Test Task',
    dueDate: '2025-12-31T23:59:59Z',
    priority: 1,
    userId: mockUser.id,
  };

  const mockReq = {
    user: mockUser,
  };

  const mockTaskService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        TaskController,
        {
          provide: 'ITaskService',
          useValue: mockTaskService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get('ITaskService');

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createDto: CreateTaskRequestDto = {
        name: 'New Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 1,
      };

      taskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockReq, createDto);

      expect(taskService.create).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(result).toEqual(
        ResponseHelper.success('Task created successfully', mockTask),
      );
    });

    it('should forward service errors', async () => {
      const createDto: CreateTaskRequestDto = {
        name: 'New Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 1,
      };

      const error = new Error('Creation failed');
      taskService.create.mockRejectedValue(error);

      await expect(controller.create(mockReq, createDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for the user', async () => {
      const mockTasks = [mockTask];
      taskService.getAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll(mockReq);

      expect(taskService.getAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(
        ResponseHelper.success('Tasks retrieved successfully', mockTasks),
      );
    });
  });

  describe('findById', () => {
    it('should return a specific task', async () => {
      taskService.getById.mockResolvedValue(mockTask);

      const result = await controller.findById(mockReq, mockTask.id);

      expect(taskService.getById).toHaveBeenCalledWith(mockUser.id, mockTask.id);
      expect(result).toEqual(
        ResponseHelper.success('Task retrieved successfully', mockTask),
      );
    });

    it('should forward service errors for non-existent task', async () => {
      const error = new Error('Task not found');
      taskService.getById.mockRejectedValue(error);

      await expect(controller.findById(mockReq, 'non-existent')).rejects.toThrow(
        error,
      );
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const updateDto: UpdateTaskRequestDto = {
        id: mockTask.id,
        name: 'Updated Task',
        priority: 2,
      };

      const updatedTask = { ...mockTask, ...updateDto };
      taskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockReq, updateDto);

      expect(taskService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result).toEqual(
        ResponseHelper.success('Task updated successfully', updatedTask),
      );
    });

    it('should forward service errors for update failures', async () => {
      const updateDto: UpdateTaskRequestDto = {
        id: 'non-existent',
        name: 'Updated Task',
      };

      const error = new Error('Update failed');
      taskService.update.mockRejectedValue(error);

      await expect(controller.update(mockReq, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete a task successfully', async () => {
      taskService.delete.mockResolvedValue(undefined);

      const result = await controller.remove(mockReq, mockTask.id);

      expect(taskService.delete).toHaveBeenCalledWith(mockUser.id, mockTask.id);
      expect(result).toEqual(ResponseHelper.success('Task deleted successfully', null));
    });

    it('should forward service errors for deletion failures', async () => {
      const error = new Error('Deletion failed');
      taskService.delete.mockRejectedValue(error);

      await expect(controller.remove(mockReq, 'non-existent')).rejects.toThrow(error);
    });
  });
});
