require('dotenv/config');
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { captureBehavior } = require('../src/modules/matchmaking/BehaviorSnapshot');
const { SnapshotComportamental1795564800000 } = require('../src/shared/database/migrations/1795564800000-SnapshotComportamental');

(async () => {
  const client = new Client({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE exposicoes_startups (id uuid PRIMARY KEY)');
    await client.query('CREATE TEMP TABLE interacoes_descoberta (investidor_id uuid, startup_id uuid, tipo text, segundos int, ocorrido_em timestamptz)');
    const manager = { query: async (sql, args) => (await client.query(sql, args)).rows };
    await new SnapshotComportamental1795564800000().up(manager);
    const i = '11111111-1111-4111-8111-111111111111', s = '22222222-2222-4222-8222-222222222222';
    await client.query("INSERT INTO interacoes_descoberta VALUES ($1,$2,'perfil_aberto',NULL,now()-interval '1 day'),($1,$2,'tempo_perfil',30,now()-interval '1 day'),($1,$2,'salvou',NULL,now()+interval '1 day')", [i,s]);
    delete process.env.BEHAVIOR_HISTORY_COMPLETE_SINCE;
    const missing = (await captureBehavior(manager,i,[s])).get(s);
    assert.equal(missing.historico_completo_90d,false); assert.equal(missing.aberturas,null);
    process.env.BEHAVIOR_HISTORY_COMPLETE_SINCE = '2000-01-01T00:00:00Z';
    const captured = (await captureBehavior(manager,i,[s])).get(s);
    assert.equal(captured.historico_completo_90d,true); assert.equal(captured.aberturas,1);
    assert.equal(captured.visitas_temporizadas,1); assert.equal(captured.segundos_perfil,30); assert.equal(captured.salvamentos,0);
    await client.query('INSERT INTO exposicoes_startups VALUES ($1,$2::jsonb)',[s,JSON.stringify(captured)]);
    assert.deepEqual((await client.query('SELECT snapshot_comportamental FROM exposicoes_startups')).rows[0].snapshot_comportamental,captured);
    console.log('OK: migration, captura pontual, cobertura e persistência em tabelas temporárias.');
  } finally { await client.query('ROLLBACK'); await client.end(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
