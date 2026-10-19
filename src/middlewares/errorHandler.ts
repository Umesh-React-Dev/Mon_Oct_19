import type { ErrorRequestHandler } from 'express';
import { isProduction } from '../config/env';
import { isAppError } from '../errors/AppError';

const isMalformedJson = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed';

/**
 * The single place errors become HTTP responses. Express identifies it as an
 * error handler because it takes FOUR arguments.
 *
 * Express 5 forwards rejected promises from async handlers here automatically,
 * so controllers don't need try/catch.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isAppError(err)) {
    res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
    return;
  }

  if (isMalformedJson(err)) {
    res.status(400).json({ error: { message: 'Malformed JSON body' } });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { message: isProduction ? 'Internal Server Error' : (err as Error).message },
  });
};
