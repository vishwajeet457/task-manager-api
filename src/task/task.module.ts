import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JsonTaskRepository } from './repository/json-task-repository';
import { TaskRepository } from './repository/task-repository';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { SharedModule } from '../shared/shared.module';
import { Pool } from 'pg';

export const taskRepoProvider: Provider = {
  provide: 'ITaskRepository',
  useFactory: (config: ConfigService,  pool: Pool) => {
    const dbMode = config.get('DB_MODE');
    if (dbMode === 'json') {
      return new JsonTaskRepository();
    }else{
      return new TaskRepository(pool);
    }
  },
  inject: [ConfigService,'PG_POOL'],
};

@Module({
    controllers: [TaskController],
    providers: [
      {
        provide: 'ITaskService',
        useClass: TaskService,
      },
      taskRepoProvider
    ],
    imports: [ConfigModule,SharedModule],
    exports: [],
})
export class TaskModule {

}
