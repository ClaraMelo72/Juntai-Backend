import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { authConfig } from '@shared/config/auth';
import { AppError } from '@shared/errors/AppError';
import { isUuid } from '@shared/validation/isUuid';
import { BehaviorSnapshot } from './BehaviorSnapshot';

export type Context = { exposureId: string; investorId: string; startupId: string; investorRevision: string; startupRevision: string; origin: 'discovery' | 'rules' | 'supervised'; position: number | null; version: string | null; behavior?: BehaviorSnapshot };
export function issueContext(context: Omit<Context, 'exposureId'>) {
  return jwt.sign({ ...context, exposureId: randomUUID() }, authConfig.secret, { algorithm: 'HS256', audience: 'card-exposure', issuer: 'juntai-backend', expiresIn: '15m' });
}
export function readContext(token: unknown): Context {
  try {
    if (typeof token !== 'string' || token.length > 4096) throw new Error();
    const value = jwt.verify(token, authConfig.secret, { algorithms: ['HS256'], audience: 'card-exposure', issuer: 'juntai-backend' }) as Context;
    if (![value.exposureId, value.investorId, value.startupId].every(isUuid) || !['discovery', 'rules', 'supervised'].includes(value.origin) || typeof value.investorRevision !== 'string' || typeof value.startupRevision !== 'string' || !(value.position === null || (Number.isInteger(value.position) && value.position > 0)) || !(value.version === null || (typeof value.version === 'string' && value.version.length <= 100))) throw new Error();
    if (value.origin === 'supervised' && (!value.version || value.position === null)) throw new Error();
    if (value.behavior) {
      const b = value.behavior;
      const keys = ['aberturas','visitas_temporizadas','segundos_perfil','salvamentos','remocoes'] as const;
      if (value.origin !== 'supervised' || b.versao !== 'behavior-v1' || b.investidor_id !== value.investorId || b.startup_id !== value.startupId || !Number.isFinite(Date.parse(b.decisao_em)) || typeof b.historico_completo_90d !== 'boolean' || (b.historico_completo_desde !== null && !Number.isFinite(Date.parse(b.historico_completo_desde)))) throw new Error();
      const complete = b.historico_completo_desde !== null && Date.parse(b.historico_completo_desde) <= Date.parse(b.decisao_em) - 90 * 86400000;
      if (complete !== b.historico_completo_90d || keys.some(k => complete ? !Number.isSafeInteger(b[k]) || b[k]! < 0 : b[k] !== null)) throw new Error();
    }
    return value;
  } catch { throw new AppError('Contexto de exposição inválido ou expirado.', 400); }
}
