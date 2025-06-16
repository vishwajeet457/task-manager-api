import { Injectable, Inject} from "@nestjs/common";
import { IUserRepository } from "../interfaces/user-repository.interface";
import { IUser } from "../interfaces/user.interface";

import { v4 as uuid } from 'uuid';
import { Pool } from 'pg';

export function mapDbToUser(row: any): IUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstname,
    lastName: row.lastname,
    password: row.password
  };
}

@Injectable()
export class UserRepository implements IUserRepository {
    
    constructor(
    @Inject('PG_POOL') private readonly pool: Pool
  ) {}

    async findByEmail(email: string): Promise<IUser | undefined> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return result.rows[0] ?  mapDbToUser(result.rows[0]) : undefined;
  }

  async findById(id: string): Promise<IUser | undefined> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapDbToUser(result.rows[0]) : undefined;
  }

  async create(data: Omit<IUser, 'id'>): Promise<IUser> {
    const id = uuid();
    const { email, password, firstName, lastName } = data;

    await this.pool.query(
      `INSERT INTO users (id, email, password, firstname, lastname)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, email, password, firstName, lastName]
    );

    return { id, ...data };
  }
}
