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
  AreaAjuda,
  DisponibilidadeInvestidor,
} from '@shared/enums';

interface CreateInvestidorDTO {
  // dados da conta (Usuario)
  nome: string;
  email: string;
  senha: string;
  avatarUrl?: string;

  // identidade / apresentação
  tituloProfissional?: string;
  linkedinUrl?: string;
  bio?: string;

  // localização
  estado?: string;
  cidade?: string;

  // perfil de atuação
  tipoInvestidor: TipoInvestidor;
  areasAjuda?: AreaAjuda[];
  disponibilidade?: DisponibilidadeInvestidor;

  // experiência prévia
  jaAtuouComStartups?: boolean;
  numeroAproximadoInvestimentos?: number;
  descricaoExperiencia?: string;
  setoresAtuacao?: Segmento[];
  anosExperiencia?: number;

  // critérios de investimento
  ticketMinimo?: number;
  ticketMaximo?: number;
  perfilRisco?: PerfilRisco;
  segmentosInteresse?: Segmento[];
  estagiosInteresse?: Estagio[];
  regioesInteresse?: Regiao[];
  modelosInteresse?: ModeloNegocio[];
  // status_moderacao NÃO entra aqui de propósito: todo investidor nasce "pendente",
  // quem muda isso é o fluxo de aprovação do admin (RF08), nunca o próprio cadastro.
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
        avatarUrl: data.avatarUrl,
      });
      const usuarioSalvo = await manager.save(usuario);

      const investidor = manager.create(Investidor, {
        usuario: usuarioSalvo,
        nome: data.nome,

        tituloProfissional: data.tituloProfissional,
        linkedinUrl: data.linkedinUrl,
        bio: data.bio,

        estado: data.estado,
        cidade: data.cidade,

        tipoInvestidor: data.tipoInvestidor,
        areasAjuda: data.areasAjuda ?? [],
        disponibilidade: data.disponibilidade,

        jaAtuouComStartups: data.jaAtuouComStartups ?? false,
        numeroAproximadoInvestimentos: data.numeroAproximadoInvestimentos,
        descricaoExperiencia: data.descricaoExperiencia,
        setoresAtuacao: data.setoresAtuacao ?? [],
        anosExperiencia: data.anosExperiencia,

        ticketMinimo: data.ticketMinimo,
        ticketMaximo: data.ticketMaximo,
        perfilRisco: data.perfilRisco,
        segmentosInteresse: data.segmentosInteresse ?? [],
        estagiosInteresse: data.estagiosInteresse ?? [],
        regioesInteresse: data.regioesInteresse ?? [],
        modelosInteresse: data.modelosInteresse ?? [],
      });

      return comUsuarioPublico(await manager.save(investidor));
    });
  }
}