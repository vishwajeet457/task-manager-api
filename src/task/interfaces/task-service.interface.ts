import { CreateTaskRequestDto } from '../dto/request/create-task.request.dto';
import { UpdateTaskRequestDto } from '../dto/request/update-task.request.dto';
import { ITask } from './task.interface';

export interface ITaskService {
  create(userId: string, dto: CreateTaskRequestDto): Promise<ITask>;
  getAll(userId: string): Promise<ITask[]>;
  getById(userId: string, taskId: string): Promise<ITask>;
  update(userId: string, dto: UpdateTaskRequestDto): Promise<ITask>;
  delete(userId: string, taskId: string): Promise<void>;
}