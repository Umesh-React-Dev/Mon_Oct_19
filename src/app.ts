import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';

/**
 * Request lifecycle (middleware runs in registration order):
 *   requestLogger -> express.json -> swagger -> /api routes -> notFound -> errorHandler
 * Any thrown error / rejected promise / next(err) jumps straight to errorHandler.
 */
const app = express();

app.use(requestLogger);
app.use(express.json());

app.get('/api/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'Mon Oct 19 API' }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
