import { EntityManager } from 'typeorm';
import { LogAuditoria } from '@modules/auditoria/entities/LogAuditoria';
import { AppDataSource as db } from '@shared/database/data-source';
import { AcaoAuditoria } from '@shared/enums';
import { AppError } from '@shared/errors/AppError';
import { isUuid } from '@shared/validation/isUuid';
import { Denuncia, StatusDenuncia, TipoAlvoModeracao } from '../entities/Denuncia';
import { EvidenciaService } from './EvidenciaService';
import { OcultacaoService } from './OcultacaoService';
import { sancoesService, validarAplicacaoSancao, validarJustificativa } from './SancaoService';

const statusPermitidos = new Set<StatusDenuncia>(['pendente', 'em_analise', 'resolvida', 'rejeitada']);
const tiposPermitidos = new Set<TipoAlvoModeracao>(['mensagem', 'avaliacao', 'startup', 'investidor']);
const resumo = `d.id, d.tipo_alvo AS "tipoAlvo", d.alvo_id AS "alvoId", d.campo_alvo AS "campoAlvo",
  d.motivo, d.status, d.criada_em AS "criadaEm", d.analisada_em AS "analisadaEm",
  d.admin_usuario_id AS "adminUsuarioId"`;

function inteiro(valor: unknown, padrao: number, maximo: number): number {
  if (valor === undefined) return padrao;
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor) || Number(valor) > maximo)
    throw new AppError('Paginação inválida.');
  return Number(valor);
}

// Datas sem horário são interpretadas em UTC. A data final inclui o dia inteiro.
function data(valor: unknown, fim = false): Date | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor.startsWith('0000'))
    throw new AppError('Informe datas no formato AAAA-MM-DD.');
  const instante = new Date(valor + 'T00:00:00.000Z');
  if (!Number.isFinite(instante.getTime()) || instante.toISOString().slice(0, 10) !== valor)
    throw new AppError('Data inválida.');
  if (fim) instante.setUTCDate(instante.getUTCDate() + 1);
  return instante;
}

function validarId(id: string): string {
  if (!isUuid(id)) throw new AppError('Identificador inválido.');
  return id.toLowerCase();
}

function validarDecisao(payload: unknown) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      Object.keys(payload).some(campo => !['procedente', 'justificativa', 'sancao'].includes(campo)))
    throw new AppError('Dados da decisão inválidos.');
  const { procedente, justificativa, sancao } = payload as Record<string, unknown>;
  if (typeof procedente !== 'boolean') throw new AppError('Informe se a denúncia é procedente.');
  if (!procedente && sancao !== undefined) throw new AppError('Uma denúncia improcedente não pode gerar sanção.');
  return {
    procedente, justificativa: validarJustificativa(justificativa),
    sancao: sancao === undefined ? undefined : validarAplicacaoSancao(sancao),
  };
}

export class AdminDenunciaService {
  private readonly evidencias = new EvidenciaService();
  private readonly ocultacoes = new OcultacaoService();

  async listar(query: Record<string, unknown>) {
    const { status, tipoAlvo } = query;
    const page = inteiro(query.page, 1, 100000);
    const size = inteiro(query.size, 15, 50);
    const inicio = data(query.inicio);
    const fim = data(query.fim, true);
    if (inicio && fim && inicio >= fim) throw new AppError('Período inválido.');
    if (status !== undefined && !statusPermitidos.has(status as StatusDenuncia))
      throw new AppError('Status inválido.');
    if (tipoAlvo !== undefined && !tiposPermitidos.has(tipoAlvo as TipoAlvoModeracao))
      throw new AppError('Tipo de alvo inválido.');

    const items = await db.query(
      `SELECT ${resumo} FROM denuncias d
       WHERE ($1::text IS NULL OR d.status=$1) AND ($2::text IS NULL OR d.tipo_alvo=$2)
         AND ($3::timestamptz IS NULL OR d.criada_em >= $3)
         AND ($4::timestamptz IS NULL OR d.criada_em < $4)
       ORDER BY d.criada_em DESC, d.id DESC LIMIT $5 OFFSET $6`,
      [status ?? null, tipoAlvo ?? null, inicio ?? null, fim ?? null, size + 1, (page - 1) * size],
    );
    return { items: items.slice(0, size), page, size, hasMore: items.length > size };
  }

  async detalhar(id: string, adminId: string) {
    id = validarId(id);
    return db.transaction('REPEATABLE READ', async manager => {
      const [row] = await manager.query(
        `SELECT ${resumo}, d.descricao, d.justificativa_decisao AS "justificativaDecisao",
           u.nome AS "adminNome", d.evidencia_snapshot AS snapshot, d.evidencia_ref AS referencia
         FROM denuncias d LEFT JOIN usuarios u ON u.id=d.admin_usuario_id WHERE d.id=$1`, [id]);
      if (!row) throw new AppError('Denúncia não encontrada.', 404);

      const { adminUsuarioId, adminNome, snapshot, referencia, ...detalhe } = row;
      const arquivo = referencia ? await this.evidencias.acessar(id, referencia) : null;
      if (snapshot !== null || arquivo?.url) {
        await this.auditar(manager, row, adminId, AcaoAuditoria.ACESSO_EVIDENCIA, {
          snapshot: snapshot !== null, arquivo: Boolean(arquivo?.url),
        });
      }
      const sancoes = await sancoesService.daDenuncia(manager, id);
      const historico = await manager.query(
        `SELECT a.id, a.acao, a.criado_em AS "criadoEm", a.detalhes,
           a.admin_usuario_id AS "adminUsuarioId", u.nome AS "adminNome"
         FROM log_auditoria a LEFT JOIN usuarios u ON u.id=a.admin_usuario_id
         WHERE (a.entidade_tipo='denuncia' AND a.entidade_id=$1)
            OR (a.entidade_tipo='sancao' AND a.entidade_id=ANY($2::text[]))
         ORDER BY a.criado_em DESC, a.id DESC`, [id, sancoes.map((sancao: { id: string }) => sancao.id)]);
      return {
        ...detalhe,
        adminResponsavel: adminUsuarioId ? { id: adminUsuarioId, nome: adminNome } : null,
        evidencia: snapshot !== null || arquivo ? { snapshot, arquivo } : null,
        sancoes,
        historico,
      };
    });
  }

  async assumir(id: string, adminId: string) {
    return this.transicionar(validarId(id), adminId);
  }

  async decidir(id: string, adminId: string, payload: unknown) {
    return this.transicionar(validarId(id), adminId, validarDecisao(payload));
  }

  private async transicionar(id: string, adminId: string, decisao?: ReturnType<typeof validarDecisao>) {
    return db.transaction('READ COMMITTED', async manager => {
      const [denuncia] = await manager.query(
        `SELECT ${resumo}, d.denunciado_usuario_id AS "denunciadoUsuarioId" FROM denuncias d WHERE d.id=$1 FOR UPDATE`, [id]);
      if (!denuncia) throw new AppError('Denúncia não encontrada.', 404);
      const statusAnterior: StatusDenuncia = denuncia.status;
      const repo = manager.getRepository(Denuncia);

      if (!decisao) {
        if (statusAnterior !== 'pendente') throw new AppError('A denúncia já foi assumida ou concluída.', 409);
        const status = 'em_analise';
        await repo.update(id, { status, adminUsuario: { id: adminId } });
        await this.auditar(manager, denuncia, adminId, AcaoAuditoria.ANALISE_DENUNCIA, { statusAnterior, statusNovo: status });
        return { id, status, adminUsuarioId: adminId, analisadaEm: null };
      }

      if (statusAnterior !== 'em_analise') throw new AppError('A denúncia precisa estar em análise para receber uma decisão.', 409);
      if (denuncia.adminUsuarioId !== adminId.toLowerCase()) throw new AppError('Somente o administrador responsável pode decidir.', 403);
      if (decisao.sancao && !denuncia.denunciadoUsuarioId)
        throw new AppError('A denúncia não tem um usuário denunciado para sancionar.', 409);
      const status = decisao.procedente ? 'resolvida' : 'rejeitada';
      const analisadaEm = new Date();
      await repo.update(id, { status, analisadaEm, justificativaDecisao: decisao.justificativa });
      await this.auditar(manager, denuncia, adminId, AcaoAuditoria.DECISAO_DENUNCIA, {
        statusAnterior, statusNovo: status, procedente: decisao.procedente, justificativa: decisao.justificativa,
      });
      if (decisao.procedente && await this.ocultacoes.aplicar(manager, denuncia, adminId)) {
        await this.auditar(manager, denuncia, adminId, AcaoAuditoria.REMOCAO_CONTEUDO, {
          operacao: 'ocultacao', justificativa: decisao.justificativa,
        });
      }
      const sancao = decisao.sancao
        ? await sancoesService.aplicar(manager, adminId, id, denuncia.denunciadoUsuarioId, decisao.sancao)
        : undefined;
      return { id, status, adminUsuarioId: denuncia.adminUsuarioId, analisadaEm, ...(sancao && { sancao }) };
    });
  }

  private async auditar(
    manager: EntityManager,
    denuncia: Pick<Denuncia, 'id' | 'tipoAlvo' | 'alvoId' | 'campoAlvo'>,
    adminId: string,
    acao: AcaoAuditoria,
    detalhes: Record<string, unknown>,
  ) {
    await manager.getRepository(LogAuditoria).save({
      adminUsuario: { id: adminId }, entidadeTipo: 'denuncia', entidadeId: denuncia.id, acao,
      detalhes: { tipoAlvo: denuncia.tipoAlvo, alvoId: denuncia.alvoId, campoAlvo: denuncia.campoAlvo, ...detalhes },
    });
  }
}
