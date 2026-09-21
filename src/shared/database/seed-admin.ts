import 'reflect-metadata';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { AppDataSource } from '@shared/database/data-source';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { TipoPerfil } from '@shared/enums';

// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin   (ADMIN_NOME é opcional)
async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;
  const nome = process.env.ADMIN_NOME || 'Administrador';

  if (!email || !senha) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env ou na linha de comando.');
  }

  await AppDataSource.initialize();

  try {
    const repo = AppDataSource.getRepository(Usuario);

    if (await repo.findOne({ where: { email } })) {
      console.log(`Já existe um usuário com o e-mail ${email}. Nada a fazer.`);
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await repo.save(repo.create({ nome, email, senhaHash, tipoPerfil: TipoPerfil.ADMIN }));
    console.log(`Administrador criado: ${email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
