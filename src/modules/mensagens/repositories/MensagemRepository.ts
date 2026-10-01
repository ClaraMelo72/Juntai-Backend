import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Mensagem } from '@modules/mensagens/entities/Mensagem';

export interface ConversaResumo {
  usuarioId: string;
  nome: string;
  tipoPerfil: string;
  ultimaMensagem: string;
  enviadaEm: Date;
  enviadaPorMim: boolean;
  naoLidas: number;
}

// Forma "achatada" da mensagem, só com os IDs do remetente/destinatário. Usada em toda
// leitura para nunca depender de o TypeORM hidratar a relação Usuario (que traria o
// senha_hash junto se um dia alguém trocar o find() por um with relations).
export interface MensagemRegistro {
  id: string;
  conteudo: string;
  enviadoEm: Date;
  lidoEm: Date | null;
  remetenteId: string;
  destinatarioId: string;
}

export class MensagemRepository {
  private get repository(): Repository<Mensagem> {
    return AppDataSource.getRepository(Mensagem);
  }

  async criar(remetenteId: string, destinatarioId: string, conteudo: string): Promise<MensagemRegistro> {
    const mensagem = this.repository.create({
      remetente: { id: remetenteId },
      destinatario: { id: destinatarioId },
      conteudo,
    } as Partial<Mensagem>);
    const salva = await this.repository.save(mensagem);
    return {
      id: salva.id,
      conteudo: salva.conteudo,
      enviadoEm: salva.enviadoEm,
      lidoEm: salva.lidoEm ?? null,
      remetenteId,
      destinatarioId,
    };
  }

  // Usado para checar se um investidor já escreveu antes para esta startup
  // (regra de negócio: só investidor pode iniciar uma conversa).
  async existeMensagemDe(remetenteId: string, destinatarioId: string): Promise<boolean> {
    const total = await this.repository.count({
      where: { remetente: { id: remetenteId }, destinatario: { id: destinatarioId } },
    });
    return total > 0;
  }

  async listarConversa(usuarioAId: string, usuarioBId: string): Promise<MensagemRegistro[]> {
    const linhas: Array<{
      id: string;
      conteudo: string;
      enviado_em: Date;
      lido_em: Date | null;
      remetente_usuario_id: string;
      destinatario_usuario_id: string;
    }> = await AppDataSource.query(
      `SELECT id, conteudo, enviado_em, lido_em, remetente_usuario_id, destinatario_usuario_id
       FROM mensagens
       WHERE (remetente_usuario_id = $1 AND destinatario_usuario_id = $2)
          OR (remetente_usuario_id = $2 AND destinatario_usuario_id = $1)
       ORDER BY enviado_em ASC`,
      [usuarioAId, usuarioBId],
    );
    return linhas.map((row) => ({
      id: row.id,
      conteudo: row.conteudo,
      enviadoEm: row.enviado_em,
      lidoEm: row.lido_em,
      remetenteId: row.remetente_usuario_id,
      destinatarioId: row.destinatario_usuario_id,
    }));
  }

  async marcarComoLidas(usuarioId: string, remetenteId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Mensagem)
      .set({ lidoEm: () => 'now()' })
      .where('destinatario_usuario_id = :usuarioId', { usuarioId })
      .andWhere('remetente_usuario_id = :remetenteId', { remetenteId })
      .andWhere('lido_em IS NULL')
      .execute();
  }

  // Última mensagem de cada conversa do usuário, mais recente primeiro, com a contagem de não lidas.
  // Duas consultas simples em vez de uma única SQL aninhada, para manter a lógica fácil de revisar.
  async listarConversas(usuarioId: string): Promise<ConversaResumo[]> {
    const ultimas: Array<{
      usuario_id: string;
      nome: string;
      tipo_perfil: string;
      conteudo: string;
      enviado_em: Date;
      enviada_por_mim: boolean;
    }> = await AppDataSource.query(
      `SELECT * FROM (
         SELECT DISTINCT ON (t.interlocutor_id)
           u.id AS usuario_id, u.nome, u.tipo_perfil,
           t.conteudo, t.enviado_em, (t.remetente_usuario_id = $1) AS enviada_por_mim
         FROM (
           SELECT
             CASE WHEN remetente_usuario_id = $1 THEN destinatario_usuario_id ELSE remetente_usuario_id END AS interlocutor_id,
             conteudo, enviado_em, remetente_usuario_id
           FROM mensagens
           WHERE remetente_usuario_id = $1 OR destinatario_usuario_id = $1
         ) t
         JOIN usuarios u ON u.id = t.interlocutor_id
         ORDER BY t.interlocutor_id, t.enviado_em DESC
       ) conversas
       ORDER BY enviado_em DESC`,
      [usuarioId],
    );

    const naoLidasPorRemetente: Array<{ remetente_usuario_id: string; total: number }> = await AppDataSource.query(
      `SELECT remetente_usuario_id, count(*)::int AS total
       FROM mensagens
       WHERE destinatario_usuario_id = $1 AND lido_em IS NULL
       GROUP BY remetente_usuario_id`,
      [usuarioId],
    );
    const naoLidas = new Map(naoLidasPorRemetente.map((row) => [row.remetente_usuario_id, Number(row.total)]));

    return ultimas.map((row) => ({
      usuarioId: row.usuario_id,
      nome: row.nome,
      tipoPerfil: row.tipo_perfil,
      ultimaMensagem: row.conteudo,
      enviadaEm: row.enviado_em,
      enviadaPorMim: row.enviada_por_mim,
      naoLidas: naoLidas.get(row.usuario_id) ?? 0,
    }));
  }
}
