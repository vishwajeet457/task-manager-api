import { IUser } from './user.interface';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | undefined>;
  findById(id: string): Promise<IUser | undefined>;
  create(data: Omit<IUser, 'id'>): Promise<IUser>;
}
