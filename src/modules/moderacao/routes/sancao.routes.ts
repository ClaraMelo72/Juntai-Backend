import { Router } from 'express';
import { ensureValidToken } from '@shared/middlewares/ensureAuthenticated';
import { handleControllerError } from '@shared/http/handleControllerError';
import { sancoesService } from '../services/SancaoService';

export const sancaoRoutes = Router();

sancaoRoutes.get('/minhas-sancoes', ensureValidToken, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    return res.json(await sancoesService.minhasVigentes(req.user!.id, req.query));
  } catch (error) {
    return handleControllerError(res, error);
  }
});
