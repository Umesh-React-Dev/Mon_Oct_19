import type { RequestHandler } from 'express';

/**
 * Validates req.body with a parser and replaces it with the parsed value.
 * Parsers throw an AppError (400) when the body is invalid.
 */
export const validateBody =
  <T>(parse: (body: unknown) => T): RequestHandler =>
  (req, _res, next) => {
    try {
      req.body = parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
