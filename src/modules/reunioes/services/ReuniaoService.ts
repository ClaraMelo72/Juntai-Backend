import { AppError } from '@shared/errors/AppError';
import { isUuid } from '@shared/validation/isUuid';
import { StatusReuniao, TipoPerfil } from '@shared/enums';
import { UsuarioRepository } from '@modules/usuarios/repositories/UsuarioRepository';
import { StartupRepository } from '@modules/startups/repositories/StartupRepository';
import { InvestidorRepository } from '@modules/investidores/repositories/InvestidorRepository';
import { ReuniaoRepository } from '@modules/reunioes/repositories/ReuniaoRepository';
import { Reuniao } from '@modules/reunioes/entities/Reuniao';
import { filtrarPerfis } from '@modules/moderacao/services/OcultacaoPerfil';

export interface ReuniaoResumo {
  id: string;
  startupId: string;
  startupNome: string | null;
  investidorId: string;
  investidorNome: string | null;
  dataHoraAgendada: Date;
  status: StatusReuniao;
  linkReuniao: string | null;
  notas: string | null;
  criadoEm: Date;
}

async function paraResumos(reunioes: Reuniao[]): Promise<ReuniaoResumo[]> {
  const [startups, investidores] = await Promise.all([
    filtrarPerfis('startup', reunioes.map(({ startup }) => ({ id: startup.id, nomeFantasia: startup.nomeFantasia }))),
    filtrarPerfis('investidor', reunioes.map(({ investidor }) => ({ id: investidor.id, nome: investidor.nome }))),
  ]);
  return reunioes.map((reuniao, indice) => ({
    id: reuniao.id,
    startupId: reuniao.startup.id,
    startupNome: startups[indice].nomeFantasia,
    investidorId: reuniao.investidor.id,
    investidorNome: investidores[indice].nome,
    dataHoraAgendada: reuniao.dataHoraAgendada,
    status: reuniao.status,
    linkReuniao: reuniao.linkReuniao ?? null,
    notas: reuniao.notas ?? null,
    criadoEm: reuniao.criadoEm,
  }));
}

// Só é permitido sair de "agendada"; os demais estados são finais.
const TRANSICOES_VALIDAS: Record<StatusReuniao, StatusReuniao[]> = {
  [StatusReuniao.AGENDADA]: [StatusReuniao.REALIZADA, StatusReuniao.CANCELADA, StatusReuniao.NO_SHOW],
  [StatusReuniao.REALIZADA]: [],
  [StatusReuniao.CANCELADA]: [],
  [StatusReuniao.NO_SHOW]: [],
};

export class ReuniaoService {
  usuarioRepository = new UsuarioRepository();
  startupRepository = new StartupRepository();
  investidorRepository = new InvestidorRepository();
  reuniaoRepository = new ReuniaoRepository();

  // Regra de negócio: só investidor propõe reunião, assim como só investidor inicia conversa.
  async agendar(
    usuarioId: string,
    startupId: unknown,
    dataHoraAgendadaIso: unknown,
    linkReuniao?: unknown,
    notas?: unknown,
  ): Promise<ReuniaoResumo> {
    if (!startupId || typeof startupId !== 'string') {
      throw new AppError('Informe a startup.', 400);
    }
    if (!isUuid(startupId)) {
      throw new AppError('Id de startup inválido.', 400);
    }
    if (typeof dataHoraAgendadaIso !== 'string') {
      throw new AppError('Informe a data e hora da reunião (ISO 8601).', 400);
    }
    const dataHoraAgendada = new Date(dataHoraAgendadaIso);
    if (Number.isNaN(dataHoraAgendada.getTime())) {
      throw new AppError('Informe uma data e hora válidas (ISO 8601).', 400);
    }
    if (dataHoraAgendada.getTime() <= Date.now()) {
      throw new AppError('A reunião deve ser agendada para uma data futura.', 400);
    }
    if (linkReuniao !== undefined && (typeof linkReuniao !== 'string' || linkReuniao.length > 255)) {
      throw new AppError('O link da reunião pode ter no máximo 255 caracteres.', 400);
    }
    if (notas !== undefined && typeof notas !== 'string') {
      throw new AppError('As notas devem ser um texto.', 400);
    }

    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.ativo) {
      throw new AppError('Usuário inválido.', 401);
    }
    if (usuario.tipoPerfil !== TipoPerfil.INVESTIDOR) {
      throw new AppError('Somente investidores podem propor reuniões.', 403);
    }

    const investidor = await this.investidorRepository.findByUsuarioId(usuarioId);
    if (!investidor) {
      throw new AppError('Perfil de investidor não encontrado.', 404);
    }

    const startup = await this.startupRepository.findById(startupId);
    if (!startup) {
      throw new AppError('Startup não encontrada.', 404);
    }

    const reuniao = await this.reuniaoRepository.criar(
      startup.id,
      investidor.id,
      dataHoraAgendada,
      linkReuniao as string | undefined,
      notas as string | undefined,
    );
    const completa = await this.reuniaoRepository.buscarPorId(reuniao.id);
    const [resumo] = await paraResumos([completa!]);
    return resumo;
  }

  async listarMinhas(usuarioId: string): Promise<ReuniaoResumo[]> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.ativo) {
      throw new AppError('Usuário inválido.', 401);
    }

    if (usuario.tipoPerfil === TipoPerfil.STARTUP) {
      const startup = await this.startupRepository.findByUsuarioId(usuarioId);
      if (!startup) return [];
      return paraResumos(await this.reuniaoRepository.listarPorStartup(startup.id));
    }
    if (usuario.tipoPerfil === TipoPerfil.INVESTIDOR) {
      const investidor = await this.investidorRepository.findByUsuarioId(usuarioId);
      if (!investidor) return [];
      return paraResumos(await this.reuniaoRepository.listarPorInvestidor(investidor.id));
    }
    throw new AppError('Este perfil não participa de reuniões.', 403);
  }

  async atualizarStatus(usuarioId: string, reuniaoId: string, novoStatus: unknown): Promise<ReuniaoResumo> {
    if (!/^\d+$/.test(reuniaoId)) {
      throw new AppError('Id de reunião inválido.', 400);
    }
    if (typeof novoStatus !== 'string' || !Object.values(StatusReuniao).includes(novoStatus as StatusReuniao)) {
      throw new AppError('Status inválido.', 400);
    }

    const reuniao = await this.reuniaoRepository.buscarPorId(reuniaoId);
    if (!reuniao) {
      throw new AppError('Reunião não encontrada.', 404);
    }

    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.ativo) {
      throw new AppError('Usuário inválido.', 401);
    }

    const ehDaStartup =
      usuario.tipoPerfil === TipoPerfil.STARTUP &&
      (await this.startupRepository.findByUsuarioId(usuarioId))?.id === reuniao.startup.id;
    const ehDoInvestidor =
      usuario.tipoPerfil === TipoPerfil.INVESTIDOR &&
      (await this.investidorRepository.findByUsuarioId(usuarioId))?.id === reuniao.investidor.id;
    if (!ehDaStartup && !ehDoInvestidor) {
      throw new AppError('Você não participa desta reunião.', 403);
    }

    if (novoStatus === StatusReuniao.REALIZADA && reuniao.dataHoraAgendada.getTime() > Date.now()) {
      throw new AppError('A reunião só pode ser concluída após o início agendado.', 400);
    }

    const permitido = TRANSICOES_VALIDAS[reuniao.status] ?? [];
    if (!permitido.includes(novoStatus as StatusReuniao)) {
      throw new AppError(`Não é possível mudar de "${reuniao.status}" para "${novoStatus}".`, 400);
    }

    await this.reuniaoRepository.atualizarStatus(reuniaoId, novoStatus as StatusReuniao);
    const [resumo] = await paraResumos([(await this.reuniaoRepository.buscarPorId(reuniaoId))!]);
    return resumo;
  }
}
