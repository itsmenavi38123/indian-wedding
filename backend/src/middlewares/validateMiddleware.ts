import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.format();
      console.log('errors', errors);
      res.status(400).json({
        message: 'Validation failed',
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
