import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Mensagem } from '@modules/mensagens/entities/Mensagem';

// Forma "achatada" da mensagem, só com o id da conversa e do remetente. Lida sempre via SQL
// explícito (nunca via relations do TypeORM), pra nunca correr o risco de um find() trazer
// o Usuario inteiro — e o senha_hash junto — se um dia alguém adicionar relations aqui.
export interface MensagemRegistro {
  id: string;
  conversaId: string;
  conteudo: string;
  enviadoEm: Date;
  lidoEm: Date | null;
  remetenteId: string;
}

export class MensagemRepository {
  private get repository(): Repository<Mensagem> {
    return AppDataSource.getRepository(Mensagem);
  }

  async criar(conversaId: string, remetenteId: string, conteudo: string): Promise<MensagemRegistro> {
    const mensagem = this.repository.create({
      conversa: { id: conversaId },
      remetente: { id: remetenteId },
      conteudo,
    } as Partial<Mensagem>);
    const salva = await this.repository.save(mensagem);
    return {
      id: salva.id,
      conversaId,
      conteudo: salva.conteudo,
      enviadoEm: salva.enviadoEm,
      lidoEm: salva.lidoEm ?? null,
      remetenteId,
    };
  }

  async listarPorConversa(conversaId: string): Promise<MensagemRegistro[]> {
    const linhas: Array<{
      id: string;
      conteudo: string;
      enviado_em: Date;
      lido_em: Date | null;
      remetente_usuario_id: string;
    }> = await AppDataSource.query(
      `SELECT id, conteudo, enviado_em, lido_em, remetente_usuario_id
       FROM mensagens
       WHERE conversa_id = $1
       ORDER BY enviado_em ASC`,
      [conversaId],
    );
    return linhas.map((row) => ({
      id: row.id,
      conversaId,
      conteudo: row.conteudo,
      enviadoEm: row.enviado_em,
      lidoEm: row.lido_em,
      remetenteId: row.remetente_usuario_id,
    }));
  }

  // Marca como lidas as mensagens da conversa que o usuário logado RECEBEU (não enviou).
  async marcarComoLidas(conversaId: string, usuarioId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Mensagem)
      .set({ lidoEm: () => 'now()' })
      .where('conversa_id = :conversaId', { conversaId })
      .andWhere('remetente_usuario_id <> :usuarioId', { usuarioId })
      .andWhere('lido_em IS NULL')
      .execute();
  }
}
