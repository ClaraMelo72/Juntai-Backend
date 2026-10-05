import bcrypt from 'bcrypt';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Startup } from '@modules/startups/entities/Startup';
import { comUsuarioPublico, UsuarioPublico } from '@modules/usuarios/mappers/usuarioPublico';
import {
  TipoPerfil,
  Segmento,
  Estagio,
  Regiao,
  ModeloNegocio,
  MetricaCrescimento,
  PeriodoComparacao,
  NecessidadeAdicional,
} from '@shared/enums';

interface CreateStartupDTO {
  // dados da conta (Usuario)
  nome: string;
  email: string;
  senha: string;
  avatarUrl?: string;

  // identidade / apresentação
  nomeFantasia: string;
  logoUrl?: string;
  apresentacaoUrl?: string;
  descricaoCurta?: string;
  siteUrl?: string;
  linksSociais?: { linkedin?: string; instagram?: string; outros?: string[] };
  videoApresentacaoUrl?: string;

  // classificação
  segmento: Segmento;
  segmentosSecundarios?: Segmento[];
  estagio: Estagio;
  modeloNegocio: ModeloNegocio;

  // localização
  estado?: string;
  cidade?: string;
  regioesAtuacao?: Regiao[];
  regioesCrescimento?: Regiao[];
  mercadoAlvo?: string;

  // métricas de evolução
  metricaCrescimento?: MetricaCrescimento;
  periodoComparacaoCrescimento?: PeriodoComparacao;
  taxaCrescimentoPct?: number;
  descricaoEvolucao?: string;
  numeroClientes?: number;
  faturamentoMensal?: number;
  tamanhoEquipe?: number;

  // captação
  buscaInvestimento?: boolean;
  capitalProcurado?: number;
  finalidadeInvestimento?: string;
  necessidadesAdicionais?: NecessidadeAdicional[];

  descricaoPitch?: string;
  canvasJson?: Record<string, unknown>;
  // status_moderacao NÃO entra aqui de propósito: toda startup nasce "pendente",
  // quem muda isso é o fluxo de aprovação do admin (RF08), nunca o próprio cadastro.
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
        avatarUrl: data.avatarUrl,
      });
      const usuarioSalvo = await manager.save(usuario);

      const startup = manager.create(Startup, {
        usuario: usuarioSalvo,

        nomeFantasia: data.nomeFantasia,
        logoUrl: data.logoUrl,
        apresentacaoUrl: data.apresentacaoUrl,
        descricaoCurta: data.descricaoCurta,
        siteUrl: data.siteUrl,
        linksSociais: data.linksSociais,
        videoApresentacaoUrl: data.videoApresentacaoUrl,

        segmento: data.segmento,
        segmentosSecundarios: data.segmentosSecundarios,
        estagio: data.estagio,
        modeloNegocio: data.modeloNegocio,

        estado: data.estado,
        cidade: data.cidade,
        regioesAtuacao: data.regioesAtuacao,
        regioesCrescimento: data.regioesCrescimento,
        mercadoAlvo: data.mercadoAlvo,

        metricaCrescimento: data.metricaCrescimento,
        periodoComparacaoCrescimento: data.periodoComparacaoCrescimento,
        taxaCrescimentoPct: data.taxaCrescimentoPct,
        descricaoEvolucao: data.descricaoEvolucao,
        numeroClientes: data.numeroClientes,
        faturamentoMensal: data.faturamentoMensal,
        tamanhoEquipe: data.tamanhoEquipe,

        buscaInvestimento: data.buscaInvestimento,
        capitalProcurado: data.capitalProcurado,
        finalidadeInvestimento: data.finalidadeInvestimento,
        necessidadesAdicionais: data.necessidadesAdicionais,

        descricaoPitch: data.descricaoPitch,
        canvasJson: data.canvasJson,
      });

      return comUsuarioPublico(await manager.save(startup));
    });
  }
}