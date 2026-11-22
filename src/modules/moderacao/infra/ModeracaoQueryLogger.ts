import { AdvancedConsoleLogger, ObjectLiteral, QueryRunner } from 'typeorm';

function consultaPrivada(query: string, parametros?: unknown[] | ObjectLiteral): boolean {
  if (/\b(denuncias|sancoes)\b/i.test(query)) return true;
  return /\blog_auditoria\b/i.test(query) &&
    Object.values(parametros ?? {}).some(valor => valor === 'denuncia' || valor === 'sancao');
}

export class ModeracaoQueryLogger extends AdvancedConsoleLogger {
  logQuery(query: string, parameters?: unknown[] | ObjectLiteral, queryRunner?: QueryRunner) {
    if (consultaPrivada(query, parameters)) return super.logQuery('Consulta de moderação');
    super.logQuery(query, parameters, queryRunner);
  }

  logQueryError(error: string, query: string, parameters?: unknown[] | ObjectLiteral, queryRunner?: QueryRunner) {
    if (consultaPrivada(query, parameters)) return super.logQueryError('Falha na consulta', 'Consulta de moderação');
    super.logQueryError(error, query, parameters, queryRunner);
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[] | ObjectLiteral, queryRunner?: QueryRunner) {
    if (consultaPrivada(query, parameters)) return super.logQuerySlow(time, 'Consulta de moderação');
    super.logQuerySlow(time, query, parameters, queryRunner);
  }
}
