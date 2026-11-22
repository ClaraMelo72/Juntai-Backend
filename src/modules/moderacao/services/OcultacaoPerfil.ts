import { AppDataSource } from '@shared/database/data-source';
import { CampoPerfilOcultado } from '../entities/CampoPerfilOcultado';

type TipoPerfilModeravel = CampoPerfilOcultado['tipoAlvo'];

// Os argumentos SQL são expressões e nomes de campo definidos no código.
export function campoVisivel(tipo: TipoPerfilModeravel, id: string, campo: string, valor: string): string {
  return `CASE WHEN NOT EXISTS (SELECT 1 FROM campos_perfil_ocultados oculto
    WHERE oculto.tipo_alvo='${tipo}' AND oculto.alvo_id=${id}
      AND oculto.campo_alvo='${campo}' AND oculto.restaurado_em IS NULL) THEN ${valor} END`;
}

export function buscaPerfilStartup(alias: string): string[] {
  return [
    campoVisivel('startup', `${alias}.id`, 'nomeFantasia', `${alias}.nome_fantasia`),
    campoVisivel('startup', `${alias}.id`, 'descricaoCurta', `${alias}.descricao_curta`),
    campoVisivel('startup', `${alias}.id`, 'descricaoPitch', `${alias}.descricao_pitch`),
  ];
}

export async function filtrarPerfis<T extends { id: string }>(
  tipo: TipoPerfilModeravel, perfis: T[], db: Pick<typeof AppDataSource, 'query'> = AppDataSource,
): Promise<T[]> {
  if (!perfis.length) return perfis;
  const ocultacoes: { alvoId: string; campo: string }[] = await db.query(
    `SELECT alvo_id AS "alvoId", campo_alvo AS campo FROM campos_perfil_ocultados
     WHERE tipo_alvo=$1 AND alvo_id=ANY($2::uuid[]) AND restaurado_em IS NULL`,
    [tipo, [...new Set(perfis.map(perfil => perfil.id))]],
  );
  const camposPorAlvo = new Map<string, string[]>();
  for (const { alvoId, campo } of ocultacoes) {
    const campos = camposPorAlvo.get(alvoId) ?? [];
    campos.push(campo);
    camposPorAlvo.set(alvoId, campos);
  }
  return perfis.map(perfil => {
    const campos = camposPorAlvo.get(perfil.id);
    if (!campos) return perfil;
    const visivel = { ...perfil };
    for (const campo of campos) {
      if (Object.hasOwn(visivel, campo)) Object.assign(visivel, { [campo]: null });
    }
    return visivel;
  });
}

export async function filtrarPerfil<T extends { id: string }>(tipo: TipoPerfilModeravel, perfil: T): Promise<T> {
  const [visivel] = await filtrarPerfis(tipo, [perfil]);
  return visivel;
}
