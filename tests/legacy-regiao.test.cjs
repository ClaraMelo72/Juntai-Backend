require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolverRegiao, resolverRegioes } = require('../src/shared/enums/legacyRegiao');

test('aceita um valor já no enum atual', () => {
  assert.deepEqual(resolverRegiao('nordeste'), ['nordeste']);
  assert.deepEqual(resolverRegiao('sudeste'), ['sudeste']);
});

test('traduz "recife" e "porto_digital" (contrato antigo) para nordeste', () => {
  assert.deepEqual(resolverRegiao('recife'), ['nordeste']);
  assert.deepEqual(resolverRegiao('porto_digital'), ['nordeste']);
});

test('traduz "nacional" (contrato antigo) para as 5 regiões', () => {
  assert.deepEqual(
    resolverRegiao('nacional').sort(),
    ['centro_oeste', 'nordeste', 'norte', 'sudeste', 'sul'],
  );
});

test('rejeita um valor desconhecido', () => {
  assert.throws(() => resolverRegiao('marte'), /não reconhecida/);
});

test('resolverRegioes junta e remove duplicatas de uma lista mista', () => {
  const resultado = resolverRegioes(['recife', 'nordeste', 'sul']).sort();
  assert.deepEqual(resultado, ['nordeste', 'sul']);
});

test('resolverRegioes com lista vazia devolve lista vazia', () => {
  assert.deepEqual(resolverRegioes([]), []);
});
