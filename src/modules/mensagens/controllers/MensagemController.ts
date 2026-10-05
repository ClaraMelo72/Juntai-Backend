import { Request, Response } from 'express';
import { MensagemService } from '@modules/mensagens/services/MensagemService';
import { handleControllerError } from '@shared/http/handleControllerError';

export class MensagemController {
  private mensagemService = new MensagemService();

  enviar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const mensagem = await this.mensagemService.enviar(
        req.user!.id,
        req.body.destinatarioId,
        req.body.conteudo,
      );
      return res.status(201).json(mensagem);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  listarConversas = async (req: Request, res: Response): Promise<Response> => {
    try {
      const conversas = await this.mensagemService.listarConversas(req.user!.id);
      return res.status(200).json(conversas);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  listarConversaCom = async (req: Request, res: Response): Promise<Response> => {
    try {
      const mensagens = await this.mensagemService.listarConversaCom(req.user!.id, String(req.params.usuarioId));
      return res.status(200).json(mensagens);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };
}
