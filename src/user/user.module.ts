import { Module, Provider } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JsonUserRepository } from './repositories/json-user-repository';
import { UserRepository } from './repositories/user-repository';
import { Pool } from 'pg';
import { SharedModule } from '../shared/shared.module';

export const userRepoProvider: Provider = {
  provide: 'IUserRepository',
  useFactory: (config: ConfigService, pool: Pool) => {
    const dbMode = config.get('DB_MODE');
    if (dbMode === 'json') {
      return new JsonUserRepository();
    }else{
      return new UserRepository(pool);
    }
  },
  inject: [ConfigService,'PG_POOL'],
};

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [
    {
          provide: 'IUserService',
          useClass: UserService,
    },
    userRepoProvider],
  exports: ['IUserService'],
})
export class UserModule {}
