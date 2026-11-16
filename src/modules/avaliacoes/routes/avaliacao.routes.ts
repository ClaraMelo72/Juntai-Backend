import { Router } from 'express';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';
import { handleControllerError } from '@shared/http/handleControllerError';
import { AvaliacaoService } from '../services/AvaliacaoService';
const service = new AvaliacaoService();
export const avaliacaoRoutes = Router();
avaliacaoRoutes.use(ensureAuthenticated);
avaliacaoRoutes.get('/pendentes', async (req,res) => {
  try { return res.json(await service.pendentes(req.user!.id)); }
  catch (e) { return handleControllerError(res,e); }
});
avaliacaoRoutes.get('/:tipo/:id', async (req,res) => {
  try { return res.json(await service.consultar(req.user!.id,String(req.params.tipo),String(req.params.id))); }
  catch (e) { return handleControllerError(res,e); }
});
avaliacaoRoutes.put('/:tipo/:id', async (req,res) => {
  try { return res.json(await service.salvar(req.user!.id,String(req.params.tipo),String(req.params.id),req.body)); }
  catch (e) { return handleControllerError(res,e); }
});
avaliacaoRoutes.post('/:tipo/:id/adiar', async (req,res) => {
  try { await service.adiar(req.user!.id,String(req.params.tipo),String(req.params.id)); return res.sendStatus(204); }
  catch (e) { return handleControllerError(res,e); }
});
