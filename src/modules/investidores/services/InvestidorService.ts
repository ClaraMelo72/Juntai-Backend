import bcrypt from 'bcrypt';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Investidor } from '@modules/investidores/entities/Investidor';
import { comUsuarioPublico, UsuarioPublico } from '@modules/usuarios/mappers/usuarioPublico';
import {
  TipoPerfil,
  TipoInvestidor,
  PerfilRisco,
  Segmento,
  Estagio,
  Regiao,
  ModeloNegocio,
} from '@shared/enums';

interface CreateInvestidorDTO {
  nome: string;
  email: string;
  senha: string;
  tipoInvestidor: TipoInvestidor;
  ticketMinimo?: number;
  ticketMaximo?: number;
  perfilRisco?: PerfilRisco;
  anosExperiencia?: number;
  bio?: string;
  segmentosInteresse?: Segmento[];
  estagiosInteresse?: Estagio[];
  regioesInteresse?: Regiao[];
  modelosInteresse?: ModeloNegocio[];
}

export type InvestidorResponse = Omit<Investidor, 'usuario'> & { usuario: UsuarioPublico };

export class InvestidorService {
  async create(data: CreateInvestidorDTO): Promise<InvestidorResponse> {
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
        tipoPerfil: TipoPerfil.INVESTIDOR,
      });
      const usuarioSalvo = await manager.save(usuario);

      const investidor = manager.create(Investidor, {
        usuario: usuarioSalvo,
        nome: data.nome,
        tipoInvestidor: data.tipoInvestidor,
        ticketMinimo: data.ticketMinimo,
        ticketMaximo: data.ticketMaximo,
        perfilRisco: data.perfilRisco,
        anosExperiencia: data.anosExperiencia,
        bio: data.bio,
        segmentosInteresse: data.segmentosInteresse ?? [],
        estagiosInteresse: data.estagiosInteresse ?? [],
        regioesInteresse: data.regioesInteresse ?? [],
        modelosInteresse: data.modelosInteresse ?? [],
      });

      return comUsuarioPublico(await manager.save(investidor));
    });
  }
}