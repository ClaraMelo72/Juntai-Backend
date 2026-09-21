import 'dotenv/config';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET não definido. Copie o .env.example para .env e preencha a variável.');
}

export const authConfig = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
