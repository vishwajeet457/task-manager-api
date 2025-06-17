import { Module } from '@nestjs/common';

import { Pool } from 'pg';

export const pgPoolProvider = {
  provide: 'PG_POOL',
  useFactory: () => {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  },
};


@Module({
  providers: [pgPoolProvider],
  exports: [pgPoolProvider],
})
export class SharedModule {}

