import { NextFunction, Request, Response } from 'express';
import { TipoPerfil } from '@shared/enums';

/**
 * Restringe a rota aos perfis informados. Deve vir DEPOIS do ensureAuthenticated.
 * Ex.: router.get('/admin/metricas', ensureAuthenticated, ensureRole(TipoPerfil.ADMIN), handler);
 */
export function ensureRole(...perfisPermitidos: TipoPerfil[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    if (!perfisPermitidos.includes(req.user.tipoPerfil)) {
      res.status(403).json({ message: 'Você não tem permissão para acessar este recurso.' });
      return;
    }

    next();
  };
}
