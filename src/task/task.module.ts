import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonTaskRepository } from './repository/json-task-repository';
import { TaskRepository } from './repository/task-repository';
import { TaskService } from 'src/task/task.service';
import { TaskController } from './task.controller';

const taskRepoProvider: Provider = {
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
    exports: [],
})
export class TaskModule {

}
