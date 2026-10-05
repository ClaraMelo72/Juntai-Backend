import { Router } from 'express';
import { InvestidorController } from '@modules/investidores/controllers/InvestidorController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const investidorRoutes = Router();
const investidorController = new InvestidorController();

investidorRoutes.post('/', investidorController.create);
investidorRoutes.get('/', ensureAuthenticated, investidorController.listar);
investidorRoutes.get('/:id', ensureAuthenticated, investidorController.buscarPorId);
investidorRoutes.patch('/:id', ensureAuthenticated, investidorController.atualizar);

export { investidorRoutes };
