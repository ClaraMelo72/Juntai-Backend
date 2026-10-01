import { Router } from 'express';
import { ReuniaoController } from '@modules/reunioes/controllers/ReuniaoController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const reuniaoRoutes = Router();
const reuniaoController = new ReuniaoController();

reuniaoRoutes.use(ensureAuthenticated);
reuniaoRoutes.post('/', reuniaoController.agendar);
reuniaoRoutes.get('/', reuniaoController.listarMinhas);
reuniaoRoutes.patch('/:id/status', reuniaoController.atualizarStatus);

export { reuniaoRoutes };
