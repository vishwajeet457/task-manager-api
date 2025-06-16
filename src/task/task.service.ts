// src/task/task.service.ts
import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskRequestDto } from './dto/request/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/request/update-task.request.dto';
import { ITaskRepository } from './interfaces/task-repository.interface';
import { ITask } from './interfaces/task.interface';
import { ITaskService } from './interfaces/task-service.interface';

@Injectable()
export class TaskService implements ITaskService {
  constructor(
    @Inject('ITaskRepository') private readonly repo: ITaskRepository
  ) {}

  async create(userId: string, dto: CreateTaskRequestDto): Promise<ITask> {
    return this.repo.create({ ...dto, userId, id: '' });
  }

  async getAll(userId: string): Promise<ITask[]> {
    return this.repo.findByUser(userId);
  }

  async getById(userId: string, id: string): Promise<ITask> {
    const task = await this.repo.findById(id);
    if (!task || task.userId !== userId) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: string,  dto: UpdateTaskRequestDto): Promise<ITask> {
    const task = await this.repo.findById(dto.id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Not allowed');

    const updated = await this.repo.update(dto.id, dto);
    if (!updated) throw new NotFoundException('Task update failed');
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Not allowed');

    await this.repo.delete(id);
  }
}
