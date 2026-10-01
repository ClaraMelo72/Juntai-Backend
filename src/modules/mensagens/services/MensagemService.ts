import { AppError } from '@shared/errors/AppError';
import { TipoPerfil } from '@shared/enums';
import { UsuarioRepository } from '@modules/usuarios/repositories/UsuarioRepository';
import {
  MensagemRepository,
  ConversaResumo,
  MensagemRegistro,
} from '@modules/mensagens/repositories/MensagemRepository';

export type MensagemResumo = MensagemRegistro;

export class MensagemService {
  usuarioRepository = new UsuarioRepository();
  mensagemRepository = new MensagemRepository();

  // Regra de negócio: só investidor pode iniciar uma conversa. A startup só responde
  // depois que um investidor já escreveu para ela antes.
  async enviar(remetenteId: string, destinatarioId: string, conteudo: unknown): Promise<MensagemResumo> {
    if (!destinatarioId || typeof destinatarioId !== 'string') {
      throw new AppError('Informe o destinatário.', 400);
    }
    if (remetenteId === destinatarioId) {
      throw new AppError('Não é possível enviar mensagem para si mesmo.', 400);
    }
    const texto = typeof conteudo === 'string' ? conteudo.trim() : '';
    if (!texto) {
      throw new AppError('A mensagem não pode ficar vazia.', 400);
    }
    if (texto.length > 5000) {
      throw new AppError('A mensagem pode ter no máximo 5000 caracteres.', 400);
    }

    const remetente = await this.usuarioRepository.findById(remetenteId);
    if (!remetente || !remetente.ativo) {
      throw new AppError('Usuário remetente inválido.', 401);
    }

    const destinatario = await this.usuarioRepository.findById(destinatarioId);
    if (!destinatario || !destinatario.ativo) {
      throw new AppError('Destinatário não encontrado.', 404);
    }

    if (remetente.tipoPerfil === TipoPerfil.INVESTIDOR) {
      if (destinatario.tipoPerfil !== TipoPerfil.STARTUP) {
        throw new AppError('Investidores só podem enviar mensagem para startups.', 403);
      }
    } else if (remetente.tipoPerfil === TipoPerfil.STARTUP) {
      if (destinatario.tipoPerfil !== TipoPerfil.INVESTIDOR) {
        throw new AppError('Startups só podem responder a investidores.', 403);
      }
      const conversaIniciada = await this.mensagemRepository.existeMensagemDe(destinatarioId, remetenteId);
      if (!conversaIniciada) {
        throw new AppError('Aguarde um investidor iniciar a conversa antes de enviar uma mensagem.', 403);
      }
    } else {
      throw new AppError('Este perfil não participa de conversas.', 403);
    }

    return this.mensagemRepository.criar(remetenteId, destinatarioId, texto);
  }

  async listarConversas(usuarioId: string): Promise<ConversaResumo[]> {
    return this.mensagemRepository.listarConversas(usuarioId);
  }

  async listarConversaCom(usuarioId: string, outroId: string): Promise<MensagemResumo[]> {
    const outro = await this.usuarioRepository.findById(outroId);
    if (!outro) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    await this.mensagemRepository.marcarComoLidas(usuarioId, outroId);
    return this.mensagemRepository.listarConversa(usuarioId, outroId);
  }
}
