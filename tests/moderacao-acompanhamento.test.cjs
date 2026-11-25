require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {AppDataSource: db} = require('../src/shared/database/data-source');
const {AvaliacaoService} = require('../src/modules/avaliacoes/services/AvaliacaoService');
const {sancoesService} = require('../src/modules/moderacao/services/SancaoService');
const {DenunciaService} = require('../src/modules/moderacao/services/DenunciaService');

test('received evaluation projection is limited to the evaluated participant and excludes private metrics', async t => {
 const usuario=randomUUID(), outro=randomUUID(), contexto=randomUUID();
 const service=new AvaliacaoService();
 t.mock.method(service,'contexto',async()=>({startup:usuario,investidor:outro,elegivel:true,nome:'Outro'}));
 t.mock.method(db,'query',async(sql,params)=>{
  assert.match(sql,/avaliador_usuario_id=\$3 AND avaliado_usuario_id=\$2/);
  assert.match(sql,/CASE WHEN NOT comentario_ocultado_por_moderacao THEN comentario END/);
  assert.deepEqual(params,[contexto,usuario,outro]);
  return [{avaliacao:null,avaliacaoRecebida:{id:'3',nota:4,comentario:'Texto',atualizadoEm:'2026-01-01'},investimentoInformadoPeloOutro:false}];
 });
 assert.equal((await service.consultar(usuario,'conversa',contexto)).avaliacaoRecebida.id,'3');
});
test('history and reports are scoped to the requesting user', async t => {
 const usuario=randomUUID();
 t.mock.method(db,'query',async(sql,params)=>{
  assert.equal(params[0],usuario);
  if(sql.includes('SELECT ativo')) return [{ativo:true}];
  if(sql.includes('FROM sancoes')) { assert.match(sql,/s.usuario_id=\$1/); assert.match(sql,/revogada_em AS "revogadaEm"/); return []; }
  assert.match(sql,/WHERE denunciante_usuario_id=\$1/);
  assert.match(sql,/evidencia_snapshot AS "conteudoDenunciado"/);
  return [];
 });
 assert.deepEqual((await sancoesService.minhasVigentes(usuario,{historico:'true'})).items,[]);
 assert.deepEqual((await new DenunciaService().listarMinhas(usuario,{})).items,[]);
 await assert.rejects(sancoesService.minhasVigentes(usuario,{historico:'false'}),{statusCode:400});
});
