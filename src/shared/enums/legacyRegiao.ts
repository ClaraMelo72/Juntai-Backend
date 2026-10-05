import { Regiao } from '@shared/enums';

// O Juntai-Frontend (registration.ts) ainda envia o enum antigo de região
// (recife, porto_digital, nordeste, nacional), de antes de o backend migrar para
// as 5 regiões do Brasil. Este mapa traduz o valor antigo para o novo enquanto o
// frontend não é atualizado. Remover quando isso acontecer.
const TODAS_AS_REGIOES = [Regiao.NORTE, Regiao.NORDESTE, Regiao.CENTRO_OESTE, Regiao.SUDESTE, Regiao.SUL];

const REGIAO_LEGADA: Record<string, Regiao[]> = {
  recife: [Regiao.NORDESTE],
  porto_digital: [Regiao.NORDESTE],
  nacional: TODAS_AS_REGIOES,
};

/** Traduz um valor de região (já no enum atual, ou do contrato antigo) em uma ou mais Regiao. */
export function resolverRegiao(valor: string): Regiao[] {
  if ((Object.values(Regiao) as string[]).includes(valor)) {
    return [valor as Regiao];
  }
  if (Object.hasOwn(REGIAO_LEGADA, valor)) {
    return REGIAO_LEGADA[valor];
  }
  throw new Error(`Região "${valor}" não reconhecida.`);
}

/** Aplica resolverRegiao a uma lista e devolve o conjunto resultante, sem duplicatas. */
export function resolverRegioes(valores: string[]): Regiao[] {
  const resultado = new Set<Regiao>();
  for (const valor of valores) {
    for (const regiao of resolverRegiao(valor)) {
      resultado.add(regiao);
    }
  }
  return [...resultado];
}
