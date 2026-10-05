import { Request, Response } from 'express';
import { InvestidorService } from '@modules/investidores/services/InvestidorService';
import { handleControllerError } from '@shared/http/handleControllerError';

export class InvestidorController {
  private investidorService = new InvestidorService();

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const investidor = await this.investidorService.create(req.body);
      return res.status(201).json(investidor);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  listar = async (_req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.investidorService.listar());
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json(await this.investidorService.buscarPorId(String(req.params.id)));
    } catch (error) {
      return handleControllerError(res, error);
    }
  };

  atualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const investidor = await this.investidorService.atualizar(req.user!.id, String(req.params.id), req.body);
      return res.status(200).json(investidor);
    } catch (error) {
      return handleControllerError(res, error);
    }
  };
}
