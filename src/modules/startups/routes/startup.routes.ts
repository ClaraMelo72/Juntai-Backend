import { Router } from 'express';
import { StartupController } from '@modules/startups/controllers/StartupController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const startupRoutes = Router();
const startupController = new StartupController();

startupRoutes.post('/', startupController.create);
startupRoutes.get('/', ensureAuthenticated, startupController.listar);
startupRoutes.get('/:id', ensureAuthenticated, startupController.buscarPorId);
startupRoutes.patch('/:id', ensureAuthenticated, startupController.atualizar);

export { startupRoutes };
