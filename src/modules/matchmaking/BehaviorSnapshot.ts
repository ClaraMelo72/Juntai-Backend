import { EntityManager } from 'typeorm';

export type BehaviorSnapshot = {
  versao: 'behavior-v1'; investidor_id: string; startup_id: string; decisao_em: string;
  historico_completo_desde: string | null; historico_completo_90d: boolean;
  aberturas: number | null; visitas_temporizadas: number | null; segundos_perfil: number | null;
  salvamentos: number | null; remocoes: number | null;
};

// Uma única consulta determina os eventos visíveis e o instante de referência.
// Cobertura não é presumida: deve ser comprovada e informada pelo operador.
export async function captureBehavior(manager: EntityManager, investorId: string, startupIds: string[]): Promise<Map<string, BehaviorSnapshot>> {
  const configured = process.env.BEHAVIOR_HISTORY_COMPLETE_SINCE;
  if (configured && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(configured) || !Number.isFinite(Date.parse(configured)))) throw new Error('BEHAVIOR_HISTORY_COMPLETE_SINCE inválido');
  const rows = await manager.query(`WITH clock AS (SELECT statement_timestamp() AS decision),
    candidates AS (SELECT unnest($2::uuid[]) AS id)
    SELECT c.id, clock.decision, $3::timestamptz AS complete_since,
      COALESCE($3::timestamptz <= clock.decision - interval '90 days', false) AS complete,
      count(*) FILTER (WHERE e.tipo='perfil_aberto')::int AS aberturas,
      count(*) FILTER (WHERE e.tipo='tempo_perfil')::int AS visitas_temporizadas,
      COALESCE(sum(e.segundos) FILTER (WHERE e.tipo='tempo_perfil'),0)::int AS segundos_perfil,
      count(*) FILTER (WHERE e.tipo='salvou')::int AS salvamentos,
      count(*) FILTER (WHERE e.tipo='removeu_salvo')::int AS remocoes
    FROM candidates c CROSS JOIN clock LEFT JOIN interacoes_descoberta e
      ON e.investidor_id=$1 AND e.startup_id=c.id AND e.ocorrido_em >= clock.decision - interval '90 days' AND e.ocorrido_em < clock.decision
    GROUP BY c.id, clock.decision`, [investorId, startupIds, configured || null]);
  return new Map(rows.map((r: any) => [r.id, { versao: 'behavior-v1', investidor_id: investorId, startup_id: r.id,
    decisao_em: new Date(r.decision).toISOString(), historico_completo_desde: r.complete_since ? new Date(r.complete_since).toISOString() : null,
    historico_completo_90d: r.complete, ...Object.fromEntries(['aberturas','visitas_temporizadas','segundos_perfil','salvamentos','remocoes'].map(k => [k, r.complete ? r[k] : null])) } as BehaviorSnapshot]));
}
