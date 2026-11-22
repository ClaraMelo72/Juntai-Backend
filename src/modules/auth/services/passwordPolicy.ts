import { AppError } from '@shared/errors/AppError';

export function validatePassword(value: unknown): asserts value is string {
  if (
    typeof value !== 'string' ||
    Array.from(value).length < 8 ||
    Buffer.byteLength(value, 'utf8') > 72 ||
    !/\p{Lu}/u.test(value) ||
    !/\p{Ll}/u.test(value) ||
    !/[0-9]/.test(value) ||
    !/[^\p{L}\p{N}\s]/u.test(value)
  ) {
    throw new AppError('Use de 8 caracteres a 72 bytes, com letras maiúsculas e minúsculas, um número e um caractere especial.', 400);
  }
}
