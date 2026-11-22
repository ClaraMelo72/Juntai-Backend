import { EntityManager } from 'typeorm';
import { AppError } from '@shared/errors/AppError';
import { Denuncia } from '../entities/Denuncia';
import { camposPerfilDenuncia } from './AlvoDenunciaService';

export class OcultacaoService {
  async aplicar(
    manager: EntityManager,
    denuncia: Pick<Denuncia, 'id' | 'tipoAlvo' | 'alvoId' | 'campoAlvo'>,
    adminId: string,
  ): Promise<boolean> {
    const { id, tipoAlvo, alvoId, campoAlvo } = denuncia;
    if (tipoAlvo === 'mensagem' || tipoAlvo === 'avaliacao') {
      const tabela = tipoAlvo === 'mensagem' ? 'mensagens' : 'avaliacoes';
      const flag = tipoAlvo === 'mensagem' ? 'ocultada_por_moderacao' : 'comentario_ocultado_por_moderacao';
      const [alvo] = await manager.query(`SELECT ${flag} AS ocultado FROM ${tabela} WHERE id=$1 FOR UPDATE`, [alvoId]);
      if (!alvo) throw new AppError('O conteúdo denunciado não está mais disponível para ocultação.', 409);
      if (alvo.ocultado) return false;
      await manager.query(`UPDATE ${tabela} SET ${flag}=true WHERE id=$1`, [alvoId]);
      return true;
    }

    if (!campoAlvo) return false;
    if (!Object.hasOwn(camposPerfilDenuncia[tipoAlvo], campoAlvo))
      throw new AppError('O campo denunciado não pode ser ocultado.', 409);
    const tabela = tipoAlvo === 'startup' ? 'startups' : 'investidores';
    const [alvo] = await manager.query(`SELECT id FROM ${tabela} WHERE id=$1 FOR KEY SHARE`, [alvoId]);
    if (!alvo) throw new AppError('O perfil denunciado não está mais disponível para ocultação.', 409);
    const [ocultacao] = await manager.query(
      `WITH inserida AS (
        INSERT INTO campos_perfil_ocultados(tipo_alvo, alvo_id, campo_alvo, denuncia_id, admin_usuario_id)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (tipo_alvo, alvo_id, campo_alvo) WHERE restaurado_em IS NULL DO NOTHING
        RETURNING id
      ) SELECT id FROM inserida`, [tipoAlvo, alvoId, campoAlvo, id, adminId]);
    return Boolean(ocultacao);
  }
}
