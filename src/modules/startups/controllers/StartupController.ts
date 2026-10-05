import { Request, Response } from 'express';
import { StartupService } from '@modules/startups/services/StartupService';
import { handleControllerError } from '@shared/http/handleControllerError';

export class StartupController {
  private startupService = new StartupService();

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const startup = await this.startupService.create(req.body);
      return res.status(201).json(startup);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  listar = async (_req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.startupService.listar());
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.startupService.buscarPorId(String(req.params.id)));
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  atualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const startup = await this.startupService.atualizar(req.user!.id, String(req.params.id), req.body);
      return res.status(200).json(startup);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };
}
