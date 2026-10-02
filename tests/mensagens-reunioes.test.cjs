process.env.JWT_SECRET = 'test-only-secret';
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MensagemService } = require('../src/modules/mensagens/services/MensagemService');
const { ReuniaoService } = require('../src/modules/reunioes/services/ReuniaoService');

function usuario(id, tipoPerfil, ativo = true) {
  return { id, ativo, tipoPerfil };
}

// Mocks padrão de resolverPar: cada perfil tem um Startup/Investidor próprio, identificado
// como "perfil-<usuarioId>". Usado pelos testes que chegam a esse ponto da regra.
function mockarPerfis(t, service) {
  t.mock.method(service.startupRepository, 'findByUsuarioId', async (id) => ({ id: `perfil-${id}` }));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async (id) => ({ id: `perfil-${id}` }));
}

test('investidor pode iniciar conversa com startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'investidor-1' ? usuario(id, 'investidor') : usuario(id, 'startup')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null); // primeira vez, ainda não existe
  t.mock.method(service.conversaRepository, 'criar', async (startupId, investidorId) => ({ id: 'conversa-1', startup: { id: startupId }, investidor: { id: investidorId } }));
  t.mock.method(service.conversaRepository, 'tocarUltimaMensagem', async () => {});
  t.mock.method(service.mensagemRepository, 'criar', async (conversaId, remetenteId, conteudo) => ({
    id: '1', conversaId, remetenteId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar('investidor-1', 'startup-1', 'Olá!');
  assert.equal(mensagem.remetenteId, 'investidor-1');
  assert.equal(mensagem.conversaId, 'conversa-1');
});

test('startup não pode iniciar conversa com investidor que nunca escreveu antes', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'startup-1' ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null);
  await assert.rejects(service.enviar('startup-1', 'investidor-1', 'Oi'), (error) => error.statusCode === 403);
});

test('startup não pode mandar mensagem para outra startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) => usuario(id, 'startup'));
  await assert.rejects(service.enviar('startup-1', 'startup-2', 'Oi'), (error) => error.statusCode === 403);
});

test('startup pode responder depois que já existe uma conversa', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'startup-1' ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => ({ id: 'conversa-1' }));
  t.mock.method(service.conversaRepository, 'tocarUltimaMensagem', async () => {});
  t.mock.method(service.mensagemRepository, 'criar', async (conversaId, remetenteId, conteudo) => ({
    id: '2', conversaId, remetenteId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar('startup-1', 'investidor-1', 'Oi, obrigado pelo contato!');
  assert.equal(mensagem.conversaId, 'conversa-1');
  assert.equal(mensagem.remetenteId, 'startup-1');
});

test('mensagem vazia é rejeitada', async () => {
  const service = new MensagemService();
  await assert.rejects(service.enviar('a', 'b', '   '), (error) => error.statusCode === 400);
});

test('investidor não pode mandar mensagem para outro investidor', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) => usuario(id, 'investidor'));
  await assert.rejects(service.enviar('investidor-1', 'investidor-2', 'Oi'), (error) => error.statusCode === 403);
});

test('listarConversaCom devolve lista vazia quando ainda não existe conversa', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'startup-1' ? usuario(id, 'startup') : usuario(id, 'investidor')));
  mockarPerfis(t, service);
  t.mock.method(service.conversaRepository, 'buscarPorPar', async () => null);
  const mensagens = await service.listarConversaCom('startup-1', 'investidor-1');
  assert.deepEqual(mensagens, []);
});

test('somente investidor pode agendar reunião', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('x', 'startup'));
  await assert.rejects(
    service.agendar('startup-1', 'startup-alvo', new Date(Date.now() + 86400000).toISOString()),
    (error) => error.statusCode === 403,
  );
});

test('reunião precisa ser marcada para uma data futura', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('x', 'investidor'));
  await assert.rejects(
    service.agendar('investidor-1', 'startup-1', new Date(Date.now() - 1000).toISOString()),
    (error) => error.statusCode === 400,
  );
});

test('só quem participa da reunião pode mudar o status', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('x', 'investidor'));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => ({ id: 'outro-investidor' }));
  t.mock.method(service.reuniaoRepository, 'buscarPorId', async () => ({
    id: 'r1',
    status: 'agendada',
    startup: { id: 'startup-1', nomeFantasia: 'X' },
    investidor: { id: 'investidor-1', nome: 'Y' },
    dataHoraAgendada: new Date(),
    criadoEm: new Date(),
  }));
  await assert.rejects(
    service.atualizarStatus('investidor-99', 'r1', 'realizada'),
    (error) => error.statusCode === 403,
  );
});

test('transição de status inválida é rejeitada', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('x', 'investidor'));
  t.mock.method(service.investidorRepository, 'findByUsuarioId', async () => ({ id: 'investidor-1' }));
  t.mock.method(service.reuniaoRepository, 'buscarPorId', async () => ({
    id: 'r1',
    status: 'realizada',
    startup: { id: 'startup-1', nomeFantasia: 'X' },
    investidor: { id: 'investidor-1', nome: 'Y' },
    dataHoraAgendada: new Date(),
    criadoEm: new Date(),
  }));
  await assert.rejects(
    service.atualizarStatus('investidor-1', 'r1', 'agendada'),
    (error) => error.statusCode === 400,
  );
});
