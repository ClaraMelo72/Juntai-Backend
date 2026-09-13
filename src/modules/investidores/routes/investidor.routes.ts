import { Router } from 'express';
import { InvestidorController } from '@modules/investidores/controllers/InvestidorController';

const investidorRoutes = Router();
const investidorController = new InvestidorController();

investidorRoutes.post('/', investidorController.create);

export { investidorRoutes };