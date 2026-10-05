require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { StartupService } = require('../src/modules/startups/services/StartupService');
const { InvestidorService } = require('../src/modules/investidores/services/InvestidorService');

const STARTUP_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const STARTUP_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const INVESTIDOR_1 = '11111111-1111-1111-1111-111111111111';

test('buscarPorId com id em formato invalido e rejeitado (400)', async () => {
  const service = new StartupService();
  await assert.rejects(service.buscarPorId('nao-e-um-uuid'), (error) => error.statusCode === 400);
});

test('buscarPorId com id valido mas inexistente retorna 404', async (t) => {
  const service = new StartupService();
  t.mock.method(service.startupRepository, 'findById', async () => null);
  await assert.rejects(service.buscarPorId(STARTUP_1), (error) => error.statusCode === 404);
});

test('atualizar: quem nao e dono do perfil recebe 403', async (t) => {
  const service = new StartupService();
  t.mock.method(service.startupRepository, 'findByUsuarioId', async () => ({ id: STARTUP_2 }));
  await assert.rejects(
    service.atualizar('outro-usuario', STARTUP_1, { nomeFantasia: 'Hackeada' }),
    (error) => error.statusCode === 403,
  );
});

test('atualizar: dono consegue editar campos permitidos', async (t) => {
  const service = new StartupService();
  const minhaStartup = { id: STARTUP_1, nomeFantasia: 'Antiga', statusModeracao: 'pendente' };
  t.mock.method(service.startupRepository, 'findByUsuarioId', async () => minhaStartup);
  t.mock.method(service.startupRepository, 'salvar', async (s) => s);
  const atualizada = await service.atualizar('dono-1', STARTUP_1, { nomeFantasia: 'Nova' });
  assert.equal(atualizada.nomeFantasia, 'Nova');
});

test('atualizar: campos fora da allowlist (ex. statusModeracao) sao ignorados mesmo se enviados', async (t) => {
  const service = new StartupService();
  const minhaStartup = { id: STARTUP_1, nomeFantasia: 'X', statusModeracao: 'pendente' };
  t.mock.method(service.startupRepository, 'findByUsuarioId', async () => minhaStartup);
  t.mock.method(service.startupRepository, 'salvar', async (s) => s);
  const atualizada = await service.atualizar('dono-1', STARTUP_1, {
    nomeFantasia: 'Y',
    statusModeracao: 'aprovado', // tentativa de auto-aprovação: deve ser ignorada
  });
  assert.equal(atualizada.nomeFantasia, 'Y');
  assert.equal(atualizada.statusModeracao, 'pendente');
});

test('atualizar: aceita regiao legada e traduz pro enum atual', async (t) => {
  const service = new StartupService();
  const minhaStartup = { id: STARTUP_1, regioesAtuacao: [] };
  t.mock.method(service.startupRepository, 'findByUsuarioId', async () => minhaStartup);
  t.mock.method(service.startupRepository, 'salvar', async (s) => s);
  const atualizada = await service.atualizar('dono-1', STARTUP_1, { regiao: 'recife' });
  assert.deepEqual(atualizada.regioesAtuacao, ['nordeste']);
});

test('investidor: quem nao e dono do perfil recebe 403', async (t) => {
  const service = new InvestidorService();
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => ({ id: 'outro-id' }));
  await assert.rejects(
    service.atualizar('qualquer', INVESTIDOR_1, { bio: 'oi' }),
    (error) => error.statusCode === 403,
  );
});

test('investidor: dono consegue editar e statusModeracao continua ignorado', async (t) => {
  const service = new InvestidorService();
  const meuInvestidor = { id: INVESTIDOR_1, bio: 'antiga', statusModeracao: 'pendente' };
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => meuInvestidor);
  t.mock.method(service.investidorRepository, 'salvar', async (i) => i);
  const atualizado = await service.atualizar('dono-1', INVESTIDOR_1, { bio: 'nova', statusModeracao: 'aprovado' });
  assert.equal(atualizado.bio, 'nova');
  assert.equal(atualizado.statusModeracao, 'pendente');
});
