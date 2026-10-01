import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Investidor } from '@modules/investidores/entities/Investidor';

export class InvestidorRepository {
  // Resolvido a cada uso: os controllers são instanciados na importação das rotas,
  // antes de o AppDataSource ser inicializado no Server.ts.
  private get repository(): Repository<Investidor> {
    return AppDataSource.getRepository(Investidor);
  }

  async create(data: Partial<Investidor>): Promise<Investidor> {
    const investidor = this.repository.create(data);
    return this.repository.save(investidor);
  }

  async findById(id: string): Promise<Investidor | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsuarioId(usuarioId: string): Promise<Investidor | null> {
    return this.repository.findOne({ where: { usuario: { id: usuarioId } } });
  }
}