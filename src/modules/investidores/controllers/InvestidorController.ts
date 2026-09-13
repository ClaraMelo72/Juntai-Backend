import { Request, Response } from 'express';
import { InvestidorService } from '@modules/investidores/services/InvestidorService';

export class InvestidorController {
  private investidorService: InvestidorService;

  constructor() {
    this.investidorService = new InvestidorService();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const investidor = await this.investidorService.create(req.body);
      return res.status(201).json(investidor);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}