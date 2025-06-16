import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JsonTaskRepository } from './repository/json-task-repository';
import { TaskRepository } from './repository/task-repository';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

export const taskRepoProvider: Provider = {
  provide: 'ITaskRepository',
  useFactory: (config: ConfigService) => {
    const dbMode = config.get('DB_MODE');
    if (dbMode === 'json') {
      return new JsonTaskRepository();
    }else{
      return new TaskRepository();
    }
  },
  inject: [ConfigService],
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
    imports: [ConfigModule],
    exports: [],
})
export class TaskModule {

}
