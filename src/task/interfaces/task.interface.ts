// src/task/interfaces/task.interface.ts
export interface ITask {
  id: string;
  name: string;
  dueDate: string; // ISO string
  priority: number;
  userId: string;
}
