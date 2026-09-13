import 'reflect-metadata';
import 'dotenv/config';

import app from './App';
import { AppDataSource } from '@shared/database/data-source';

const PORT = process.env.PORT || 3333; // 3333 pra bater com o Docker

AppDataSource.initialize()
  .then(() => {
    console.log('Banco conectado');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar no banco', error);
    process.exit(1);
  });