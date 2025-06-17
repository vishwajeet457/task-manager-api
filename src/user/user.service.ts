import { Inject, Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IUserService } from './interfaces/user.service.interface';


@Injectable()
export class UserService implements IUserService{
    constructor(@Inject('IUserRepository') private readonly repo: IUserRepository,){

    }
  
    async findByEmail(email: string) {
        return await this.repo.findByEmail(email);
    }

    async findById(id: string) {
      return await this.repo.findById(id);
    }

    async create(userData: Omit<IUser, 'id'>) {
      const user = await this.repo.findByEmail(userData.email);
      if (user) { 
        throw new Error('User with this email already exists');
      }
      return this.repo.create(userData);
    }
}
