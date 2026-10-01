process.env.JWT_SECRET = 'test-only-secret';
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MensagemService } = require('../src/modules/mensagens/services/MensagemService');
const { ReuniaoService } = require('../src/modules/reunioes/services/ReuniaoService');

function usuario(tipoPerfil, ativo = true) {
  return { ativo, tipoPerfil };
}

test('investidor pode iniciar conversa com startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'investidor-1' ? usuario('investidor') : usuario('startup')));
  t.mock.method(service.mensagemRepository, 'criar', async (remetenteId, destinatarioId, conteudo) => ({
    id: '1', remetenteId, destinatarioId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar('investidor-1', 'startup-1', 'Olá!');
  assert.equal(mensagem.remetenteId, 'investidor-1');
  assert.equal(mensagem.destinatarioId, 'startup-1');
});

test('startup não pode iniciar conversa com investidor que nunca escreveu antes', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'startup-1' ? usuario('startup') : usuario('investidor')));
  t.mock.method(service.mensagemRepository, 'existeMensagemDe', async () => false);
  await assert.rejects(service.enviar('startup-1', 'investidor-1', 'Oi'), (error) => error.statusCode === 403);
});

test('startup não pode mandar mensagem para outra startup', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('startup'));
  await assert.rejects(service.enviar('startup-1', 'startup-2', 'Oi'), (error) => error.statusCode === 403);
});

test('startup pode responder depois que o investidor já escreveu', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async (id) =>
    (id === 'startup-1' ? usuario('startup') : usuario('investidor')));
  t.mock.method(service.mensagemRepository, 'existeMensagemDe', async () => true);
  t.mock.method(service.mensagemRepository, 'criar', async (remetenteId, destinatarioId, conteudo) => ({
    id: '2', remetenteId, destinatarioId, conteudo, enviadoEm: new Date(), lidoEm: null,
  }));
  const mensagem = await service.enviar('startup-1', 'investidor-1', 'Oi, obrigado pelo contato!');
  assert.equal(mensagem.destinatarioId, 'investidor-1');
});

test('mensagem vazia é rejeitada', async () => {
  const service = new MensagemService();
  await assert.rejects(service.enviar('a', 'b', '   '), (error) => error.statusCode === 400);
});

test('investidor não pode mandar mensagem para outro investidor', async (t) => {
  const service = new MensagemService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('investidor'));
  await assert.rejects(service.enviar('investidor-1', 'investidor-2', 'Oi'), (error) => error.statusCode === 403);
});

test('somente investidor pode agendar reunião', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('startup'));
  await assert.rejects(
    service.agendar('startup-1', 'startup-alvo', new Date(Date.now() + 86400000).toISOString()),
    (error) => error.statusCode === 403,
  );
});

test('reunião precisa ser marcada para uma data futura', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('investidor'));
  await assert.rejects(
    service.agendar('investidor-1', 'startup-1', new Date(Date.now() - 1000).toISOString()),
    (error) => error.statusCode === 400,
  );
});

test('só quem participa da reunião pode mudar o status', async (t) => {
  const service = new ReuniaoService();
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('investidor'));
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
  t.mock.method(service.usuarioRepository, 'findById', async () => usuario('investidor'));
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
