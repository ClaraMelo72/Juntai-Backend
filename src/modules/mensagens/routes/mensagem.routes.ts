import { Router } from 'express';
import { MensagemController } from '@modules/mensagens/controllers/MensagemController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const mensagemRoutes = Router();
const mensagemController = new MensagemController();

mensagemRoutes.use(ensureAuthenticated);

// /conversas precisa vir antes de /:usuarioId, senão o Express entende "conversas" como um id.
mensagemRoutes.get('/conversas', mensagemController.listarConversas);
mensagemRoutes.post('/', mensagemController.enviar);
mensagemRoutes.get('/:usuarioId', mensagemController.listarConversaCom);

export { mensagemRoutes };
