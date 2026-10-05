import { Request, Response } from 'express';
import { ReuniaoService } from '@modules/reunioes/services/ReuniaoService';
import { handleControllerError } from '@shared/http/handleControllerError';

export class ReuniaoController {
  private reuniaoService = new ReuniaoService();

  agendar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { startupId, dataHoraAgendada, linkReuniao, notas } = req.body;
      const reuniao = await this.reuniaoService.agendar(
        req.user!.id,
        startupId,
        dataHoraAgendada,
        linkReuniao,
        notas,
      );
      return res.status(201).json(reuniao);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  listarMinhas = async (req: Request, res: Response): Promise<Response> => {
    try {
      const reunioes = await this.reuniaoService.listarMinhas(req.user!.id);
      return res.status(200).json(reunioes);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  atualizarStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const reuniao = await this.reuniaoService.atualizarStatus(req.user!.id, String(req.params.id), req.body.status);
      return res.status(200).json(reuniao);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };
}
