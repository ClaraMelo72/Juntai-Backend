import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Startup } from '@modules/startups/entities/Startup';
import { StatusModeracao } from '@shared/enums';

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

  // Sem relations: nunca carrega o Usuario (e o senha_hash) nessas duas, só os dados da startup.
  async listarTodas(): Promise<Startup[]> {
    return this.repository.find({ order: { criadoEm: 'DESC' } });
  }

  async listarAprovadas(): Promise<Startup[]> {
    return this.repository.find({ where: { statusModeracao: StatusModeracao.APROVADO, usuario: { ativo: true } }, order: { criadoEm: 'DESC' } });
  }

  async salvar(startup: Startup): Promise<Startup> {
    return this.repository.save(startup);
  }
}