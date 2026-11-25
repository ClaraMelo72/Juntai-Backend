import { MigrationInterface, QueryRunner } from 'typeorm';

export class SnapshotComportamental1795564800000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE exposicoes_startups ADD COLUMN snapshot_comportamental jsonb');
  }
  async down(): Promise<void> {
    throw new Error('Rollback requer plano explícito de preservação dos snapshots.');
  }
}
