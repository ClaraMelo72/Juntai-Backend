import { Response } from 'express';
import { AppError } from '@shared/errors/AppError';

export function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}
