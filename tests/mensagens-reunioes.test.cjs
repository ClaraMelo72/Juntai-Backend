process.env.JWT_SECRET = 'test-only-secret';
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MensagemService } = require('../src/modules/mensagens/services/MensagemService');
const { ReuniaoService } = require('../src/modules/reunioes/services/ReuniaoService');

// Ids de teste em formato de UUID válido: destinatarioId/startupId passam por um isUuid()
// antes de qualquer mock, então um id tipo "startup-1" é rejeitado (400) antes de chegar lá.
const INVESTIDOR_1 = '11111111-1111-1111-1111-111111111111';
const INVESTIDOR_2 = '22222222-2222-2222-2222-222222222222';
const INVESTIDOR_99 = '99999999-9999-9999-9999-999999999999';
const STARTUP_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const STARTUP_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const STARTUP_ALVO = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function usuario(id, tipoPerfil, ativo = true) {
  return { id, ativo, tipoPerfil };
}

// Mocks padrão de resolverPar: cada perfil tem um Startup/Investidor próprio, identificado
// como "perfil-<usuarioId>". Usado pelos testes que chegam a esse ponto da regra.
function mockarPerfis(t, service) {
  t.mock.method(service.startupRepository, 'findByUsuarioId', async (id) => ({ id: `perfil-${id}` }));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async (id) => ({ id: `perfil-${id}` }));
}

test('mensagem com destinatário em formato inválido é rejeitada', async () => {
  const service = new MensagemService();
  await assert.rejects(service.enviar(INVESTIDOR_1, 'nao-e-um-uuid', 'Oi'), (error) => error.statusCode === 400);
});

test('investidor pode iniciar conversa com startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === INVESTIDOR_1 ? usuario(id, 'investidor') : usuario(id, 'startup')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null); // primeira vez, ainda não existe
  t.mock.method(service.conversaRepository, 'criar', async (startupId, investidorId) => ({ id: 'conversa-1', startup: { id: startupId }, investidor: { id: investidorId } }));
  t.mock.method(service.conversaRepository, 'tocarUltimaMensagem', async () => {});
  t.mock.method(service.mensagemRepository, 'criar', async (conversaId, remetenteId, conteudo) => ({
    id: '1', conversaId, remetenteId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar(INVESTIDOR_1, STARTUP_1, 'Olá!');
  assert.equal(mensagem.remetenteId, INVESTIDOR_1);
  assert.equal(mensagem.conversaId, 'conversa-1');
});

test('startup não pode iniciar conversa com investidor que nunca escreveu antes', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === STARTUP_1 ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null);
  await assert.rejects(service.enviar(STARTUP_1, INVESTIDOR_1, 'Oi'), (error) => error.statusCode === 403);
});

test('startup não pode mandar mensagem para outra startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) => usuario(id, 'startup'));
  await assert.rejects(service.enviar(STARTUP_1, STARTUP_2, 'Oi'), (error) => error.statusCode === 403);
});

test('startup pode responder depois que já existe uma conversa', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === STARTUP_1 ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => ({ id: 'conversa-1' }));
  t.mock.method(service.conversaRepository, 'tocarUltimaMensagem', async () => {});
  t.mock.method(service.mensagemRepository, 'criar', async (conversaId, remetenteId, conteudo) => ({
    id: '2', conversaId, remetenteId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar(STARTUP_1, INVESTIDOR_1, 'Oi, obrigado pelo contato!');
  assert.equal(mensagem.conversaId, 'conversa-1');
  assert.equal(mensagem.remetenteId, STARTUP_1);
});

test('mensagem vazia é rejeitada', async () => {
  const service = new MensagemService();
  await assert.rejects(service.enviar(INVESTIDOR_1, STARTUP_1, '   '), (error) => error.statusCode === 400);
});

test('investidor não pode mandar mensagem para outro investidor', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) => usuario(id, 'investidor'));
  await assert.rejects(service.enviar(INVESTIDOR_1, INVESTIDOR_2, 'Oi'), (error) => error.statusCode === 403);
});

test('listarConversaCom devolve lista vazia quando ainda não existe conversa', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === STARTUP_1 ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null);
  const mensagens = await service.listarConversaCom(STARTUP_1, INVESTIDOR_1);
  assert.deepEqual(mensagens, []);
});

test('somente investidor pode agendar reunião', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario(STARTUP_1, 'startup'));
  await assert.rejects(
    service.agendar(STARTUP_1, STARTUP_ALVO, new Date(Date.now() + 86400000).toISOString()),
    (error) => error.statusCode === 403,
  );
});

test('reunião com id de startup em formato inválido é rejeitada', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario(INVESTIDOR_1, 'investidor'));
  await assert.rejects(
    service.agendar(INVESTIDOR_1, 'nao-e-um-uuid', new Date(Date.now() + 86400000).toISOString()),
    (error) => error.statusCode === 400,
  );
});

test('reunião precisa ser marcada para uma data futura', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario(INVESTIDOR_1, 'investidor'));
  await assert.rejects(
    service.agendar(INVESTIDOR_1, STARTUP_1, new Date(Date.now() - 1000).toISOString()),
    (error) => error.statusCode === 400,
  );
});

test('só quem participa da reunião pode mudar o status', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario(INVESTIDOR_99, 'investidor'));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => ({ id: 'outro-investidor' }));
  t.mock.method(service.reuniaoRepository, 'buscarPorId', async () => ({
    id: '1',
    status: 'agendada',
    startup: { id: STARTUP_1, nomeFantasia: 'X' },
    investidor: { id: INVESTIDOR_1, nome: 'Y' },
    dataHoraAgendada: new Date(),
    criadoEm: new Date(),
  }));
  await assert.rejects(
    service.atualizarStatus(INVESTIDOR_99, '1', 'realizada'),
    (error) => error.statusCode === 403,
  );
});

test('reunião com id em formato inválido é rejeitada', async (t) => {
  const service = new ReuniaoService();
  await assert.rejects(
    service.atualizarStatus(INVESTIDOR_1, 'nao-e-numero', 'realizada'),
    (error) => error.statusCode === 400,
  );
});

test('transição de status inválida é rejeitada', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario(INVESTIDOR_1, 'investidor'));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => ({ id: INVESTIDOR_1 }));
  t.mock.method(service.reuniaoRepository, 'buscarPorId', async () => ({
    id: '1',
    status: 'realizada',
    startup: { id: STARTUP_1, nomeFantasia: 'X' },
    investidor: { id: INVESTIDOR_1, nome: 'Y' },
    dataHoraAgendada: new Date(),
    criadoEm: new Date(),
  }));
  await assert.rejects(
    service.atualizarStatus(INVESTIDOR_1, '1', 'agendada'),
    (error) => error.statusCode === 400,
  );
});
