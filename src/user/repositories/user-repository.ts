import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../interfaces/user-repository.interface";
import { IUser } from "../interfaces/user.interface";

@Injectable()
export class UserRepository implements IUserRepository {
    // constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}
    
    async findById(id: string): Promise<IUser | undefined> {
        throw new Error("Method not implemented.");
    }
    create(data: Omit<IUser, "id">): Promise<IUser> {
        throw new Error("Method not implemented.");
    }

  async findByEmail(email: string): Promise<IUser | undefined> {
    throw new Error("Method not implemented.");
  }

  // Similar create() and findById()...
}
