import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { ITaskRepository } from './interfaces/task-repository.interface';
import { CreateTaskRequestDto } from './dto/request/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/request/update-task.request.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ITask } from './interfaces/task.interface';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  const mockUserId = 'user-123';
  const mockTaskId = 'task-123';

  const mockTask: ITask = {
    id: mockTaskId,
    name: 'Test Task',
    dueDate: '2025-12-31T23:59:59Z',
    priority: 1,
    userId: mockUserId
  };

  const mockCreateTaskDto: CreateTaskRequestDto = {
    name: 'Test Task',
    dueDate: '2025-12-31T23:59:59Z',
    priority: 1
  };

  const mockUpdateTaskDto: UpdateTaskRequestDto = {
    id: mockTaskId,
    name: 'Updated Task',
    dueDate: '2025-12-31T23:59:59Z',
    priority: 2
  };

  const updatedTask: ITask = {
    ...mockTask,
    ...mockUpdateTaskDto
  };

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: 'ITaskRepository',
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      mockTaskRepository.create.mockResolvedValue(mockTask);
      
      const result = await service.create(mockUserId, mockCreateTaskDto);
      
      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...mockCreateTaskDto,
        userId: mockUserId,
        id: ''
      });
    });
  });

  describe('getAll', () => {
    it('should return all tasks for a user', async () => {
      const mockTasks = [mockTask];
      mockTaskRepository.findByUser.mockResolvedValue(mockTasks);
      
      const result = await service.getAll(mockUserId);
      
      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.findByUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getById', () => {
    it('should return a task by id when user owns it', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      
      const result = await service.getById(mockUserId, mockTaskId);
      
      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(mockTaskId);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);
      
      await expect(service.getById(mockUserId, mockTaskId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the task', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        ...mockTask,
        userId: 'different-user'
      });
      
      await expect(service.getById(mockUserId, mockTaskId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task successfully when user owns it', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);
      
      const result = await service.update(mockUserId, mockUpdateTaskDto);
      
      expect(result).toBeDefined();
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(mockTaskId);

     expect(mockTaskRepository.update).toHaveBeenCalledWith(mockTaskId, {
        name: 'Updated Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 2
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);
      
      await expect(service.update(mockUserId, mockUpdateTaskDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the task', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        ...mockTask,
        userId: 'different-user'
      });
      
      await expect(service.update(mockUserId, mockUpdateTaskDto))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when update fails', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(null);
      
      await expect(service.update(mockUserId, mockUpdateTaskDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a task successfully when user owns it', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue();
      
      await service.delete(mockUserId, mockTaskId);
      
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(mockTaskId);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);
      
      await expect(service.delete(mockUserId, mockTaskId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the task', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        ...mockTask,
        userId: 'different-user'
      });
      
      await expect(service.delete(mockUserId, mockTaskId))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

});