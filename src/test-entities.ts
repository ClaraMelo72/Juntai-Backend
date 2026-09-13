// Script temporário só pra testar a conexão e as entities.
// Depois que confirmar que funciona, pode apagar ou guardar como seed de dados simulados
// (item 4 do doc. de IA: "bases simuladas" pra alimentar o dataset de startups/investidores).

import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Startup } from '@modules/startups/entities/Startup';
import { Investidor } from '@modules/investidores/entities/Investidor';
import { TipoPerfil, Segmento, Estagio, Regiao, ModeloNegocio, PerfilRisco } from '@shared/enums';

async function main() {
  await AppDataSource.initialize();
  console.log('✅ Banco conectado e schema sincronizado.');

  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const startupRepo = AppDataSource.getRepository(Startup);
  const investidorRepo = AppDataSource.getRepository(Investidor);

  const userAna = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Ana',
      email: `ana+${Date.now()}@startup.com`, // e-mail único a cada execução
      senhaHash: 'hash-fake-so-pra-teste',
      tipoPerfil: TipoPerfil.STARTUP,
    }),
  );

  const userBruno = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Bruno',
      email: `bruno+${Date.now()}@investidor.com`,
      senhaHash: 'hash-fake-so-pra-teste',
      tipoPerfil: TipoPerfil.INVESTIDOR,
    }),
  );

  const startup = await startupRepo.save(
    startupRepo.create({
      usuario: userAna,
      nomeFantasia: 'FinTechPE',
      segmento: Segmento.FINTECH,
      estagio: Estagio.TRACAO,
      regiao: Regiao.RECIFE,
      modeloNegocio: ModeloNegocio.B2B,
      capitalProcurado: 800000,
    }),
  );

  const investidor = await investidorRepo.save(
    investidorRepo.create({
      usuario: userBruno,
      nome: 'Bruno Anjo',
      ticketMinimo: 300000,
      ticketMaximo: 1000000,
      perfilRisco: PerfilRisco.MODERADO,
      segmentosInteresse: [Segmento.FINTECH, Segmento.SAAS_B2B],
      estagiosInteresse: [Estagio.TRACAO, Estagio.CRESCIMENTO],
      regioesInteresse: [Regiao.NORDESTE],
      modelosInteresse: [ModeloNegocio.B2B],
    }),
  );

  console.log('✅ Startup criada:', startup.id, startup.nomeFantasia);
  console.log('✅ Investidor criado:', investidor.id, investidor.nome);

  await AppDataSource.destroy();
  console.log('✅ Conexão encerrada. Teste concluído com sucesso.');
}

main().catch((err) => {
  console.error('❌ ERRO NO TESTE:', err);
  process.exit(1);
});
