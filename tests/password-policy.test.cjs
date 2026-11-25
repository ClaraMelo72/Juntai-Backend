require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validatePassword } = require('../src/modules/auth/services/passwordPolicy');
const { StartupService } = require('../src/modules/startups/services/StartupService');
const { InvestidorService } = require('../src/modules/investidores/services/InvestidorService');

test('password policy accepts strong passwords and rejects missing categories or oversized input', () => {
  for (const value of ['Senha123!', 'Árvore9!']) assert.doesNotThrow(() => validatePassword(value));
  for (const value of ['Ab1!', 'senha123!', 'SENHA123!', 'SenhaSemNumero!', 'Senha1234', 'Senha1!'+ 'a'.repeat(70), null])
    assert.throws(() => validatePassword(value));
});

test('both registration services reject weak passwords before accessing storage', async () => {
  await assert.rejects(new StartupService().create({ senha: 'weak' }), /maiúsculas/);
  await assert.rejects(new InvestidorService().create({ senha: 'weak' }), /maiúsculas/);
});
