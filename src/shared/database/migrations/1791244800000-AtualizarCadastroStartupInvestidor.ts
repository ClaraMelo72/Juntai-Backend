import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AtualizarCadastroStartupInvestidor1791244800000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const enums: Record<string, string[]> = {
      segmento_enum: [
        'fintech', 'healthtech', 'edtech', 'agtech', 'saas_b2b',
        'marketplace', 'ecommerce', 'economia_criativa',
      ],
      estagio_enum: ['ideacao', 'validacao', 'mvp', 'tracao', 'crescimento', 'escala'],
      modelo_negocio_enum: ['b2b', 'b2c', 'b2b2c', 'marketplace', 'assinatura_saas'],
      tipo_investidor_enum: ['anjo', 'mentor', 'anjo_mentor'],
      perfil_risco_enum: ['conservador', 'moderado', 'arrojado'],
      regiao_enum: ['norte', 'nordeste', 'centro_oeste', 'sudeste', 'sul'],
      metrica_crescimento_enum: ['receita', 'clientes', 'clientes_e_receita'],
      periodo_comparacao_enum: [
        'ultimos_3_meses', 'ultimos_6_meses', 'ultimo_ano', 'desde_fundacao',
      ],
      necessidade_adicional_enum: [
        'mentoria', 'conexoes_mercado', 'contratacao_talentos',
        'parcerias_estrategicas', 'outro',
      ],
      area_ajuda_enum: [
        'mentoria', 'networking', 'operacoes', 'vendas_marketing', 'growth',
        'financeiro_juridico', 'produto_tecnologia', 'rh_pessoas',
      ],
      disponibilidade_investidor_enum: [
        'algumas_horas_mes', 'algumas_horas_semana', 'meio_periodo', 'dedicacao_integral',
      ],
    };

    for (const [name, values] of Object.entries(enums)) {
      const literals = values.map((value) => `'${value}'`).join(', ');
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "${name}" AS ENUM (${literals});
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
      for (const value of values) {
        await queryRunner.query(
          `ALTER TYPE "${name}" ADD VALUE IF NOT EXISTS '${value}'`,
        );
      }
    }

    await queryRunner.query(`
      ALTER TABLE "startups"
        ADD COLUMN IF NOT EXISTS "descricao_curta" varchar(300),
        ADD COLUMN IF NOT EXISTS "site_url" varchar(255),
        ADD COLUMN IF NOT EXISTS "links_sociais" jsonb,
        ADD COLUMN IF NOT EXISTS "video_apresentacao_url" text,
        ADD COLUMN IF NOT EXISTS "segmentos_secundarios" segmento_enum[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "estado" varchar(2),
        ADD COLUMN IF NOT EXISTS "cidade" varchar(100),
        ADD COLUMN IF NOT EXISTS "regioes_atuacao" regiao_enum[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "regioes_crescimento" regiao_enum[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "metrica_crescimento" metrica_crescimento_enum,
        ADD COLUMN IF NOT EXISTS "periodo_comparacao_crescimento" periodo_comparacao_enum,
        ADD COLUMN IF NOT EXISTS "descricao_evolucao" text,
        ADD COLUMN IF NOT EXISTS "busca_investimento" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "necessidades_adicionais" necessidade_adicional_enum[] NOT NULL DEFAULT '{}';
    `);

    await queryRunner.query(`
      ALTER TABLE "investidores"
        ADD COLUMN IF NOT EXISTS "titulo_profissional" varchar(150),
        ADD COLUMN IF NOT EXISTS "linkedin_url" varchar(255),
        ADD COLUMN IF NOT EXISTS "estado" varchar(2),
        ADD COLUMN IF NOT EXISTS "cidade" varchar(100),
        ADD COLUMN IF NOT EXISTS "areas_ajuda" area_ajuda_enum[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "disponibilidade" disponibilidade_investidor_enum,
        ADD COLUMN IF NOT EXISTS "ja_atuou_com_startups" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "numero_aproximado_investimentos" smallint,
        ADD COLUMN IF NOT EXISTS "descricao_experiencia" text,
        ADD COLUMN IF NOT EXISTS "setores_atuacao" segmento_enum[] NOT NULL DEFAULT '{}';
    `);

    const startup = await queryRunner.getTable('startups');
    if (startup?.findColumnByName('regiao')) {
      await queryRunner.query(
        'ALTER TABLE "startups" ALTER COLUMN "regiao" DROP NOT NULL',
      );
    }
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'Reversao automatica desabilitada para preservar os dados e os valores legados dos enums.',
    );
  }
}
