import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';

export class UsuarioRepository {
  // Resolvido a cada uso: os controllers são instanciados na importação das rotas,
  // antes de o AppDataSource ser inicializado no Server.ts.
  private get repository(): Repository<Usuario> {
    return AppDataSource.getRepository(Usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.repository.findOne({ where: { id } });
  }
}
