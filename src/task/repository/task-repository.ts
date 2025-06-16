import { ITaskRepository } from '../interfaces/task-repository.interface';
import { ITask } from '../interfaces/task.interface';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuid } from 'uuid';

function mapDbToTask(row: any): ITask {
  return {
    id: row.id,
    name: row.name,
    dueDate: row.duedate,
    priority: row.priority,
    userId: row.userid,     
  };
}



export class TaskRepository implements ITaskRepository {
  
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool, 
  ) {}

  async create(task: ITask): Promise<ITask> {
    const id = uuid();
    const query = `
      INSERT INTO tasks (id, name, duedate, priority, userid)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id, task.name, task.dueDate, task.priority, task.userId];
    const result = await this.pool.query(query, values);
    return mapDbToTask(result.rows[0]);
  }

  async update(taskId: string, updates: Partial<ITask>): Promise<ITask | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(taskId);
    const result = await this.pool.query(query, values);
    return result.rowCount ? mapDbToTask(result.rows[0])  : null;
  }

  async delete(taskId: string): Promise<void> {
    await this.pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  }

  async findById(taskId: string): Promise<ITask | null> {
    const result = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return  result.rowCount ? mapDbToTask(result.rows[0]) : null;
  }

  async findByUser(userId: string): Promise<ITask[]> {
    const result = await this.pool.query("SELECT id, name, TO_CHAR(duedate, 'YYYY-MM-DD') AS duedate, priority,userid FROM tasks WHERE userid = $1", [userId]);
    const tasks = result.rows.map(mapDbToTask);
    return tasks as ITask[];
  }
}
