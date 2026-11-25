// Executes only the password-recovery migration through TypeORM.
require('ts-node/register/transpile-only');
require('reflect-metadata');
const { DataSource, MigrationExecutor } = require('typeorm');
const { PasswordRecovery1795000000000 } = require('../src/shared/database/migrations/1795000000000-PasswordRecovery');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

async function main() {
  const test = process.argv[2] === '--test';
  assert.ok(test || process.argv[2] === '--azure', 'Specify --test or --azure');
  const password = test ? 'disposable-test-only' : execFileSync('docker', ['exec','juntai-azure-cli-session','az','containerapp','secret','list','-g','juntai-beta','-n','juntai-beta-api','--show-values','--query',"[?name=='db-password'].value | [0]",'-o','tsv'], {encoding:'utf8'}).trim();
  assert.ok(password, 'Database password unavailable');
  const db = new DataSource({ type:'postgres', host:test?'127.0.0.1':'juntai.postgres.database.azure.com', port:test?55439:5432, username:test?'postgres':'juntai_beta_app', password, database:test?'recovery_test':'juntai_beta', ssl:test?false:{rejectUnauthorized:true}, synchronize:false, migrationsRun:false, migrationsTableName:'migrations', migrations:[PasswordRecovery1795000000000], entities:[], logging:false });
  await db.initialize();
  const q = db.createQueryRunner();
  try {
    await q.connect();
    await q.startTransaction();
    const [{name}] = await q.query('SELECT current_database() AS name');
    assert.equal(name, test?'recovery_test':'juntai_beta');
    if (test) await q.query('CREATE TABLE public.usuarios (id uuid PRIMARY KEY)');
    const [{history}] = await q.query("SELECT to_regclass('public.migrations')::text AS history");
    assert.ok(test || history, 'Migration history missing; stop for investigation');
    if (history) await q.query('LOCK TABLE public.migrations IN SHARE ROW EXCLUSIVE MODE');
    await q.query('LOCK TABLE public.usuarios IN ACCESS EXCLUSIVE MODE');
    const [{column_exists, tokens, limits}] = await q.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='session_version') AS column_exists, to_regclass('public.password_recovery_tokens')::text AS tokens, to_regclass('public.password_recovery_limits')::text AS limits");
    if (history) {
      const rows = await q.query('SELECT name FROM public.migrations WHERE name=$1', ['PasswordRecovery1795000000000']);
      assert.equal(rows.length, 0, 'Migration already recorded; no changes made');
    }
    assert.ok(!column_exists && !tokens && !limits, 'Migration objects already exist; stop for investigation');
    const executor = new MigrationExecutor(db, q);
    const result = await executor.executePendingMigrations();
    assert.deepEqual(result.map(m => m.name), ['PasswordRecovery1795000000000']);
    const rows = await q.query('SELECT name FROM public.migrations WHERE name=$1', ['PasswordRecovery1795000000000']);
    assert.equal(rows.length, 1);
    const [after] = await q.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='session_version') AS column_exists, to_regclass('public.password_recovery_tokens')::text AS tokens, to_regclass('public.password_recovery_limits')::text AS limits");
    assert.ok(after.column_exists && after.tokens && after.limits);
    await q.commitTransaction();
    console.log('Migration applied once and recorded in TypeORM history in ' + name);
  } catch (error) { if (q.isTransactionActive) await q.rollbackTransaction(); throw error; }
  finally { await q.release(); await db.destroy(); }
}
main().catch(e => { console.error('Stopped:', e.message); process.exitCode=1; });
