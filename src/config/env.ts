import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL:
    process.env.DATABASE_URL ?? `postgresql://${process.env.USER ?? 'postgres'}@127.0.0.1:5432/mon_oct_19`,
};

export const isProduction = env.NODE_ENV === 'production';
