import { Inject, Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { IUserRepository } from './interfaces/user-repository.interface';


@Injectable()
export class UserService {
    constructor(@Inject('IUserRepository') private readonly repo: IUserRepository,){

    }
  
    findByEmail(email: string) {
        return this.repo.findByEmail(email);
    }

  findById(id: string) {
    return this.repo.findById(id);
  }

  create(userData: Omit<IUser, 'id'>) {
    return this.repo.create(userData);
  }
}
