import { ITaskRepository } from '../interfaces/task-repository.interface';
import { ITask } from '../interfaces/task.interface';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(__dirname, '../../../data/tasks.json');

export class JsonTaskRepository implements ITaskRepository {
  private async read(): Promise<ITask[]> {
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private async write(tasks: ITask[]) {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
  }

  async create(task: ITask): Promise<ITask> {
    const tasks = await this.read();
    const newTask = { ...task, id: uuid() };
    tasks.push(newTask);
    await this.write(tasks);
    return newTask;
  }

  async update(taskId: string, updates: Partial<ITask>): Promise<ITask | null> {
    const tasks = await this.read();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    await this.write(tasks);
    return tasks[index];
  }

  async delete(taskId: string): Promise<void> {
    const tasks = await this.read();
    const updated = tasks.filter(t => t.id !== taskId);
    await this.write(updated);
  }

  async findById(taskId: string): Promise<ITask | null> {
    const tasks = await this.read();
    return tasks.find(t => t.id === taskId) || null;
  }

  async findByUser(userId: string): Promise<ITask[]> {
    const tasks = await this.read();
    return tasks.filter(t => t.userId === userId);
  }
}
