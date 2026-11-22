import { MigrationInterface, QueryRunner } from 'typeorm';

export class EvidenciaDenuncia1794873600001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE denuncias ADD COLUMN evidencia_snapshot jsonb');
    await queryRunner.query('CREATE INDEX denuncias_denunciante_data_idx ON denuncias(denunciante_usuario_id, criada_em DESC, id DESC)');
  }

  async down(): Promise<void> {
    throw new Error('Reversão automática indisponível para preservar evidências de denúncias.');
  }
}
