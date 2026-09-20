import { Router } from 'express';
import { AuthController } from '@modules/auth/controllers/AuthController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', ensureAuthenticated, authController.me);

export { authRoutes };
