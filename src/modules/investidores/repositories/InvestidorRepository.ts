import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Investidor } from '@modules/investidores/entities/Investidor';

export class InvestidorRepository {
  private repository: Repository<Investidor>;

  constructor() {
    this.repository = AppDataSource.getRepository(Investidor);
  }

  async create(data: Partial<Investidor>): Promise<Investidor> {
    const investidor = this.repository.create(data);
    return this.repository.save(investidor);
  }

  async findByUsuarioId(usuarioId: string): Promise<Investidor | null> {
    return this.repository.findOne({ where: { usuario: { id: usuarioId } } });
  }
}