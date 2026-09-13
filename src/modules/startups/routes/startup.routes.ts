import { Router } from 'express';
import { StartupController } from '@modules/startups/controllers/StartupController';

const startupRoutes = Router();
const startupController = new StartupController();

startupRoutes.post('/', startupController.create);

export { startupRoutes };