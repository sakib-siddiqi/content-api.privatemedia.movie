import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { Cache } from './models/cache.model';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const db_host = new URL(configService.get<string>('SUPABASE_PROJECT_URL') || '').host;
      if (!db_host) {
        throw new Error('DATABASE URL is not defined in environment variables');
      }

      const sequelize = new Sequelize('postgresql://postgres.brkhkpwapsbxoavdghjv:JKk6iMKUhK4A3PJh@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',{
        dialect: 'postgres',
        password: configService.get<string>('SUPABASE_DB_PASSWORD'),
        logging: false,
        models: [Cache],
      });

      await sequelize.authenticate();
      console.log('✅ Connected to Supabase Postgres successfully');
      return sequelize;
    },
  },
];
