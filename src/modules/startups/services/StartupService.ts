import bcrypt from 'bcrypt';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Startup } from '@modules/startups/entities/Startup';
import { comUsuarioPublico, UsuarioPublico } from '@modules/usuarios/mappers/usuarioPublico';
import { TipoPerfil, Segmento, Estagio, Regiao, ModeloNegocio } from '@shared/enums';

interface CreateStartupDTO {
  nome: string;
  email: string;
  senha: string;
  nomeFantasia: string;
  segmento: Segmento;
  estagio: Estagio;
  regiao: Regiao;
  modeloNegocio: ModeloNegocio;
  mercadoAlvo?: string;
  numeroClientes?: number;
  faturamentoMensal?: number;
  taxaCrescimentoPct?: number;
  capitalProcurado: number;
  finalidadeInvestimento?: string;
  tamanhoEquipe?: number;
  descricaoPitch?: string;
  canvasJson?: Record<string, unknown>;
}

export type StartupResponse = Omit<Startup, 'usuario'> & { usuario: UsuarioPublico };

export class StartupService {
  async create(data: CreateStartupDTO): Promise<StartupResponse> {
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    const emailExiste = await usuarioRepo.findOne({ where: { email: data.email } });
    if (emailExiste) {
      throw new Error('E-mail já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return AppDataSource.transaction(async (manager) => {
      const usuario = manager.create(Usuario, {
        nome: data.nome,
        email: data.email,
        senhaHash,
        tipoPerfil: TipoPerfil.STARTUP,
      });
      const usuarioSalvo = await manager.save(usuario);

      const startup = manager.create(Startup, {
        usuario: usuarioSalvo,
        nomeFantasia: data.nomeFantasia,
        segmento: data.segmento,
        estagio: data.estagio,
        regiao: data.regiao,
        modeloNegocio: data.modeloNegocio,
        mercadoAlvo: data.mercadoAlvo,
        numeroClientes: data.numeroClientes,
        faturamentoMensal: data.faturamentoMensal,
        taxaCrescimentoPct: data.taxaCrescimentoPct,
        capitalProcurado: data.capitalProcurado,
        finalidadeInvestimento: data.finalidadeInvestimento,
        tamanhoEquipe: data.tamanhoEquipe,
        descricaoPitch: data.descricaoPitch,
        canvasJson: data.canvasJson,
      });

      return comUsuarioPublico(await manager.save(startup));
    });
  }
}