import { TipoPerfil } from '@shared/enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tipoPerfil: TipoPerfil;
      };
    }
  }
}

export {};
