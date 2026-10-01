import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Startup } from '@modules/startups/entities/Startup';

export class StartupRepository {
  // Resolvido a cada uso: os controllers são instanciados na importação das rotas,
  // antes de o AppDataSource ser inicializado no Server.ts.
  private get repository(): Repository<Startup> {
    return AppDataSource.getRepository(Startup);
  }

  async create(data: Partial<Startup>): Promise<Startup> {
    const startup = this.repository.create(data);
    return this.repository.save(startup);
  }

  async findById(id: string): Promise<Startup | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsuarioId(usuarioId: string): Promise<Startup | null> {
    return this.repository.findOne({ where: { usuario: { id: usuarioId } } });
  }
}