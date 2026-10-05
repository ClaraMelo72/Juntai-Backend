import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ConversasMensagens1791244800002 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS conversas (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      startup_id uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
      investidor_id uuid NOT NULL REFERENCES investidores(id) ON DELETE CASCADE,
      criada_em timestamptz NOT NULL DEFAULT now(),
      ultima_mensagem_em timestamptz NULL,
      CONSTRAINT conversas_par_unico UNIQUE (startup_id, investidor_id)
    )`);
    await q.query('ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS conversa_id uuid');
    const legacy = await q.hasColumn('mensagens', 'destinatario_usuario_id');
    if (legacy) {
      await q.query(`INSERT INTO conversas (startup_id, investidor_id, criada_em, ultima_mensagem_em)
        SELECT s.id, i.id, min(m.enviado_em), max(m.enviado_em)
        FROM mensagens m
        JOIN startups s ON s.usuario_id = m.remetente_usuario_id OR s.usuario_id = m.destinatario_usuario_id
        JOIN investidores i ON i.usuario_id = m.remetente_usuario_id OR i.usuario_id = m.destinatario_usuario_id
        WHERE m.remetente_usuario_id <> m.destinatario_usuario_id
        GROUP BY s.id, i.id
        ON CONFLICT (startup_id, investidor_id) DO NOTHING`);
      await q.query(`UPDATE mensagens m SET conversa_id = c.id
        FROM conversas c JOIN startups s ON s.id = c.startup_id JOIN investidores i ON i.id = c.investidor_id
        WHERE m.conversa_id IS NULL AND
          ((m.remetente_usuario_id = s.usuario_id AND m.destinatario_usuario_id = i.usuario_id)
           OR (m.remetente_usuario_id = i.usuario_id AND m.destinatario_usuario_id = s.usuario_id))`);
      // The current service derives the recipient from the conversation. Retain old values.
      await q.query('ALTER TABLE mensagens ALTER COLUMN destinatario_usuario_id DROP NOT NULL');
    }
    const [invalid] = await q.query('SELECT count(*)::int AS total FROM mensagens WHERE conversa_id IS NULL');
    if (invalid.total) throw new Error('Existem mensagens antigas sem par startup/investidor válido. Migration cancelada para preservar os registros.');
    await q.query('ALTER TABLE mensagens ALTER COLUMN conversa_id SET NOT NULL');
    await q.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mensagens_conversa_fk' AND conrelid = 'mensagens'::regclass) THEN
        ALTER TABLE mensagens ADD CONSTRAINT mensagens_conversa_fk FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE;
      END IF;
    END $$`);
    await q.query('CREATE INDEX IF NOT EXISTS mensagens_conversa_enviado_idx ON mensagens (conversa_id, enviado_em)');
    await q.query('CREATE INDEX IF NOT EXISTS mensagens_conversa_nao_lidas_idx ON mensagens (conversa_id, remetente_usuario_id) WHERE lido_em IS NULL');
  }
  async down(): Promise<void> {
    throw new Error('Reversão automática indisponível para preservar o histórico de conversas e mensagens.');
  }
}
