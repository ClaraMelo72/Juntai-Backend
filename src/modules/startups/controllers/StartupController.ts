import { Request, Response } from 'express';
import { StartupService } from '@modules/startups/services/StartupService';

export class StartupController {
  private startupService: StartupService;

  constructor() {
    this.startupService = new StartupService();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const startup = await this.startupService.create(req.body);
      return res.status(201).json(startup);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}