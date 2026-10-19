import app from './app';
import { initDb } from './config/db';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await initDb();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Swagger UI at http://localhost:${env.PORT}/api/docs`);
  });
};

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
