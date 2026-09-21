import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '@shared/config/auth';
import { TipoPerfil } from '@shared/enums';

interface TokenPayload {
  sub: string;
  tipoPerfil: TipoPerfil;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Token não informado.' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Formato do token inválido. Use: Bearer <token>.' });
    return;
  }

  try {
    const { sub, tipoPerfil } = jwt.verify(token, authConfig.secret) as unknown as TokenPayload;
    req.user = { id: sub, tipoPerfil };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}
