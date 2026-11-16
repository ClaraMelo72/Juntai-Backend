import { MigrationInterface, QueryRunner } from 'typeorm';
export class FeedbackInteracoes1794787200000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS avaliacoes (
      id bigserial PRIMARY KEY, reuniao_id bigint REFERENCES reunioes(id),
      avaliador_usuario_id uuid NOT NULL REFERENCES usuarios(id),
      avaliado_usuario_id uuid NOT NULL REFERENCES usuarios(id),
      nota smallint NOT NULL, comentario text, criado_em timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS conversa_id uuid REFERENCES conversas(id),
      ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now()`);
    // NOT VALID preserves historical records; constraints still apply to all new writes.
    await q.query(`ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_nota CHECK (nota BETWEEN 1 AND 5) NOT VALID,
      ADD CONSTRAINT avaliacoes_autor CHECK (avaliador_usuario_id <> avaliado_usuario_id) NOT VALID,
      ADD CONSTRAINT avaliacoes_contexto CHECK (num_nonnulls(reuniao_id,conversa_id)=1) NOT VALID,
      ADD CONSTRAINT avaliacoes_comentario CHECK (char_length(comentario)<=2000) NOT VALID`);
    await q.query(`CREATE UNIQUE INDEX avaliacoes_reuniao_autor ON avaliacoes(reuniao_id,avaliador_usuario_id) WHERE reuniao_id IS NOT NULL`);
    await q.query(`CREATE UNIQUE INDEX avaliacoes_conversa_autor ON avaliacoes(conversa_id,avaliador_usuario_id) WHERE conversa_id IS NOT NULL`);
    await q.query(`CREATE TABLE avaliacao_adiamentos (
      usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      tipo text NOT NULL CHECK (tipo IN ('reuniao','conversa')), contexto_id text NOT NULL,
      adiado_ate timestamptz NOT NULL, PRIMARY KEY (usuario_id,tipo,contexto_id))`);
    await q.query(`CREATE INDEX IF NOT EXISTS reunioes_agendadas_inicio ON reunioes(data_hora_agendada) WHERE status='agendada'`);
  }
  async down(): Promise<void> {
    throw new Error('Reversão automática indisponível para preservar avaliações.');
  }
}
