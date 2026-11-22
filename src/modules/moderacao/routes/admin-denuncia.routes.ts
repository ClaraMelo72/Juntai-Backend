import { Request, Response, Router } from 'express';
import { handleControllerError } from '@shared/http/handleControllerError';
import { AppError } from '@shared/errors/AppError';
import { AdminDenunciaService } from '../services/AdminDenunciaService';

export const adminDenunciaRoutes = Router();
const service = new AdminDenunciaService();

function responder(executar: (req: Request) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    try {
      return res.json(await executar(req));
    } catch (error) {
      if (error instanceof AppError) return handleControllerError(res, error);

      // O driver pode embutir parâmetros privados no objeto de erro.
      const codigo = (error as { code?: unknown } | null)?.code;
      console.error('Falha na administração de denúncias', {
        codigo: typeof codigo === 'string' && /^[0-9A-Z]{5}$/.test(codigo) ? codigo : undefined,
      });
      return handleControllerError(res, new AppError('Erro interno do servidor.', 500));
    }
  };
}

adminDenunciaRoutes.get('/', responder(req => service.listar(req.query)));
adminDenunciaRoutes.get('/:id', responder(req => service.detalhar(String(req.params.id), req.user!.id)));
adminDenunciaRoutes.post('/:id/assumir', responder(req => service.assumir(String(req.params.id), req.user!.id)));
adminDenunciaRoutes.post('/:id/decisao', responder(req => service.decidir(String(req.params.id), req.user!.id, req.body)));
