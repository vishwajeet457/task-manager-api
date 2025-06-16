import { ITaskRepository } from '../interfaces/task-repository.interface';
import { ITask } from '../interfaces/task.interface';


export class TaskRepository implements ITaskRepository {
  async create(task: ITask): Promise<ITask> {
    throw new Error('Method not implemented.');
  }

  async update(taskId: string, updates: Partial<ITask>): Promise<ITask | null> {
    throw new Error('Method not implemented.');
  }

  async delete(taskId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findById(taskId: string): Promise<ITask | null> {
    throw new Error('Method not implemented.');
  }

  async findByUser(userId: string): Promise<ITask[]> {
    throw new Error('Method not implemented.');
  }
}
