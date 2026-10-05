import { MigrationInterface, QueryRunner } from "typeorm";
export class IndicesAuditoria1791244800003 implements MigrationInterface {
  name = "IndicesAuditoria1791244800003";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_auditoria_criado_id ON log_auditoria (criado_em DESC, id DESC)",
    );
    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON log_auditoria (entidade_id, criado_em DESC)",
    );
    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_auditoria_admin ON log_auditoria (admin_usuario_id)",
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP INDEX IF EXISTS idx_auditoria_admin");
    await queryRunner.query("DROP INDEX IF EXISTS idx_auditoria_entidade");
    await queryRunner.query("DROP INDEX IF EXISTS idx_auditoria_criado_id");
  }
}
