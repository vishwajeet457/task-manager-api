import { IUserRepository } from '../interfaces/user-repository.interface';
import { Injectable } from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

@Injectable()
export class JsonUserRepository implements IUserRepository {

    constructor(){
        this.ensureFile();
    }
private async ensureFile() {
  if (!(await fs.pathExists(DB_PATH))) {
    await fs.outputJson(DB_PATH, []); // Creates parent folders and writes []
  }
}

  private async readUsers(): Promise<IUser[]> {
    const exists = await fs.pathExists(DB_PATH);
    if (!exists) await fs.writeJson(DB_PATH, []);
    return fs.readJson(DB_PATH);
  }

  private async writeUsers(users: IUser[]) {
    await fs.writeJson(DB_PATH, users, { spaces: 2 });
  }

  async findByEmail(email: string): Promise<IUser | undefined> {
    const users = await this.readUsers();
    return users.find(u => u.email === email);
  }

  async findById(id: string): Promise<IUser | undefined> {
    const users = await this.readUsers();
    return users.find(u => u.id === id);
  }

  async create(data: Omit<IUser, 'id'>): Promise<IUser> {
    const users = await this.readUsers();
    const newUser: IUser = { id: uuid(), ...data };
    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }
}
