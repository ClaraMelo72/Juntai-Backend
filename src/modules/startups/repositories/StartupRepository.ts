import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Startup } from '@modules/startups/entities/Startup';

export class StartupRepository {
  private repository: Repository<Startup>;

  constructor() {
    this.repository = AppDataSource.getRepository(Startup);
  }

  async create(data: Partial<Startup>): Promise<Startup> {
    const startup = this.repository.create(data);
    return this.repository.save(startup);
  }

  async findByUsuarioId(usuarioId: string): Promise<Startup | null> {
    return this.repository.findOne({ where: { usuario: { id: usuarioId } } });
  }
}