import { Module, Provider } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JsonUserRepository } from './repositories/json-user-repository';
import { UserRepository } from './repositories/user-repository';

const userRepoProvider: Provider = {
  provide: 'IUserRepository',
  useFactory: (config: ConfigService) => {
    const dbMode = config.get('DB_MODE');
    if (dbMode === 'json') {
      return new JsonUserRepository();
    }else{
      return new UserRepository();
    }
  },
  inject: [ConfigService],
};

@Module({
  controllers: [],
  providers: [UserService,userRepoProvider],
  exports: [UserService],
})
export class UserModule {}
