import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UsuarioAvatarOpcional1791244800001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "avatar_url" text NULL');
    await queryRunner.query('ALTER TABLE "usuarios" ALTER COLUMN "avatar_url" DROP NOT NULL');
  }

  async down(): Promise<void> {
    throw new Error('Reversão automática indisponível para preservar URLs de avatar existentes.');
  }
}
