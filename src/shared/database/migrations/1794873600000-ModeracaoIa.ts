import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModeracaoIa1794873600000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE mensagens ADD COLUMN ocultada_por_moderacao boolean NOT NULL DEFAULT false`);
    await q.query(`ALTER TABLE avaliacoes ADD COLUMN comentario_ocultado_por_moderacao boolean NOT NULL DEFAULT false`);
    await q.query(`ALTER TABLE log_auditoria ALTER COLUMN entidade_id TYPE varchar(36) USING entidade_id::text`);
    for (const action of ['analise_denuncia', 'decisao_denuncia', 'acesso_evidencia', 'aplicacao_sancao', 'revogacao_sancao']) {
      await q.query(`ALTER TYPE acao_auditoria_enum ADD VALUE IF NOT EXISTS '${action}'`);
    }
    await q.query(`CREATE TABLE denuncias (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      denunciante_usuario_id uuid NOT NULL REFERENCES usuarios(id),
      denunciado_usuario_id uuid REFERENCES usuarios(id),
      tipo_alvo text NOT NULL CHECK (tipo_alvo IN ('mensagem','avaliacao','startup','investidor')),
      alvo_id varchar(36) NOT NULL CHECK (length(alvo_id)>0), campo_alvo varchar(100),
      motivo varchar(100) NOT NULL CHECK (length(trim(motivo))>0), descricao text,
      status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','resolvida','rejeitada')),
      criada_em timestamptz NOT NULL DEFAULT now(), analisada_em timestamptz,
      admin_usuario_id uuid REFERENCES usuarios(id), justificativa_decisao text, evidencia_ref text,
      analise_ia_considerada_id uuid, concordancia_ia text CHECK (concordancia_ia IN ('concorda','discorda','parcial')),
      CHECK (concordancia_ia IS NULL OR analise_ia_considerada_id IS NOT NULL)
    )`);
    await q.query(`CREATE INDEX denuncias_fila_idx ON denuncias(status, criada_em)`);
    await q.query(`CREATE UNIQUE INDEX denuncias_abertas_unicas ON denuncias(denunciante_usuario_id,tipo_alvo,alvo_id,COALESCE(campo_alvo,'')) WHERE status IN ('pendente','em_analise')`);
    await q.query(`CREATE TABLE analises_moderacao_ia (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), denuncia_id uuid NOT NULL REFERENCES denuncias(id),
      status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','processando','concluida','falhou')),
      categoria_prevista text CHECK (categoria_prevista IN ('assedio_ameaca','spam','possivel_fraude','conteudo_improprio','sem_violacao_identificada','insuficiente')),
      prioridade text CHECK (prioridade IN ('baixa','media','alta')),
      score_risco numeric(5,4) CHECK (score_risco BETWEEN 0 AND 1),
      justificativa text CHECK (char_length(justificativa)<=4000), modelo varchar(150), versao_modelo varchar(100),
      politica_versao varchar(100) NOT NULL, evidencia_referencia text, trecho_referencia text,
      erro_codigo varchar(100), criada_em timestamptz NOT NULL DEFAULT now(), concluida_em timestamptz,
      duracao_ms integer CHECK (duracao_ms>=0),
      CONSTRAINT analise_ia_denuncia_id_unico UNIQUE (denuncia_id,id),
      CHECK (status <> 'concluida' OR (categoria_prevista IS NOT NULL AND prioridade IS NOT NULL AND justificativa IS NOT NULL AND modelo IS NOT NULL AND versao_modelo IS NOT NULL AND evidencia_referencia IS NOT NULL AND concluida_em IS NOT NULL))
    )`);
    await q.query(`CREATE INDEX analises_ia_denuncia_data_idx ON analises_moderacao_ia(denuncia_id,criada_em)`);
    await q.query(`CREATE INDEX analises_ia_status_data_idx ON analises_moderacao_ia(status,criada_em)`);
    await q.query(`ALTER TABLE denuncias ADD CONSTRAINT denuncia_analise_mesma_denuncia_fk FOREIGN KEY (id,analise_ia_considerada_id) REFERENCES analises_moderacao_ia(denuncia_id,id)`);
    await q.query(`CREATE TABLE sancoes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), usuario_id uuid NOT NULL REFERENCES usuarios(id),
      denuncia_id uuid REFERENCES denuncias(id), tipo text NOT NULL CHECK (tipo IN ('advertencia','restricao_chat','suspensao','banimento')),
      motivo text NOT NULL, inicio_em timestamptz NOT NULL DEFAULT now(), fim_em timestamptz,
      admin_usuario_id uuid NOT NULL REFERENCES usuarios(id), revogada_em timestamptz,
      revogada_por_usuario_id uuid REFERENCES usuarios(id), justificativa_revogacao text,
      CHECK (fim_em IS NULL OR fim_em >= inicio_em),
      CHECK ((revogada_em IS NULL AND revogada_por_usuario_id IS NULL AND justificativa_revogacao IS NULL) OR (revogada_em IS NOT NULL AND revogada_por_usuario_id IS NOT NULL AND justificativa_revogacao IS NOT NULL))
    )`);
    await q.query(`CREATE INDEX sancoes_usuario_vigencia_idx ON sancoes(usuario_id,inicio_em,fim_em) WHERE revogada_em IS NULL`);
    await q.query(`CREATE TABLE campos_perfil_ocultados (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tipo_alvo text NOT NULL CHECK (tipo_alvo IN ('startup','investidor')),
      alvo_id uuid NOT NULL, campo_alvo varchar(100) NOT NULL, denuncia_id uuid REFERENCES denuncias(id),
      admin_usuario_id uuid NOT NULL REFERENCES usuarios(id), ocultado_em timestamptz NOT NULL DEFAULT now(), restaurado_em timestamptz,
      CHECK (restaurado_em IS NULL OR restaurado_em >= ocultado_em)
    )`);
    await q.query(`CREATE UNIQUE INDEX campos_perfil_ocultados_ativos_idx ON campos_perfil_ocultados(tipo_alvo,alvo_id,campo_alvo) WHERE restaurado_em IS NULL`);
  }
  async down(): Promise<void> {
    throw new Error('Reversao automatica indisponivel para preservar dados de moderacao e auditoria.');
  }
}
