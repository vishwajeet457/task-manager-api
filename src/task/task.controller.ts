import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  HttpCode,
  Inject,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateTaskRequestDto } from './dto/request/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/request/update-task.request.dto';
import { ApiBearerAuth, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { ApiBaseResponse } from '../common/decorators/api-base-response.decorator';
import { ResponseHelper } from '../common/response/response.helper';
import { ITask } from './interfaces/task.interface';
import { TaskResponseDto } from './dto/response/task.response.dto';
import { BaseResponse } from 'src/common/response/base-response.dto';
import { ITaskService } from './interfaces/task-service.interface';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(@Inject('ITaskService') private readonly taskService: ITaskService) {}

  @Post("create")
  @HttpCode(201)
  @ApiBody({ type: CreateTaskRequestDto })
  @ApiBaseResponse(Object, 'Task created successfully')
  async create(@Req() req, @Body() dto: CreateTaskRequestDto) : Promise<BaseResponse<ITask>> {
    const task = await this.taskService.create(req.user.id, dto);
    return ResponseHelper.success<ITask>('Task created successfully', task);
  }

  @Get()
  @ApiBaseResponse(TaskResponseDto, 'User task list')
  async findAll(@Req() req) : Promise<BaseResponse<ITask[]>> {
    const tasks = await this.taskService.getAll(req.user.id);
    return ResponseHelper.success<ITask[]>('Tasks retrieved successfully', tasks);
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBaseResponse(TaskResponseDto, 'Task retrieved successfully')
  async findById(@Req() req, @Param('id') id: string) : Promise<BaseResponse<ITask>> {
    const task = await this.taskService.getById(req.user.id, id);
    return ResponseHelper.success<ITask>('Task retrieved successfully', task);
  }

  @Post('update')
  @HttpCode(200)
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiBaseResponse(TaskResponseDto, 'Task updated successfully')
  async update(@Req() req,  @Body() dto: UpdateTaskRequestDto) : Promise<BaseResponse<ITask>> {
    const task = await this.taskService.update(req.user.id, dto);
    return ResponseHelper.success<ITask>('Task updated successfully', task);
  }

  @Delete('delete/:id')
  @HttpCode(200)
  @ApiParam({ name: 'id', required: true })
  async remove(@Req() req, @Param('id') id: string) {
    await this.taskService.delete(req.user.id, id);
    return ResponseHelper.success('Task deleted successfully', null);;
  }
}
