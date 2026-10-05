import { type MigrationInterface, type QueryRunner } from 'typeorm';
export class StartupApresentacaoUrl1791158400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "logo_url" text');
    await queryRunner.query('ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "apresentacao_url" text');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "startups" DROP COLUMN IF EXISTS "apresentacao_url"');
  }
}
