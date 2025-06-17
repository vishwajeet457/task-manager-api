import { ITask } from './task.interface';

export interface ITaskRepository {
  create(task: ITask): Promise<ITask>;
  update(taskId: string, updates: Partial<ITask>): Promise<ITask | null>;
  delete(taskId: string): Promise<void>;
  findById(taskId: string): Promise<ITask | null>;
  findByUser(userId: string): Promise<ITask[]>;
}
