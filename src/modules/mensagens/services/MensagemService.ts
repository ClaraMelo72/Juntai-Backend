import { AppError } from '@shared/errors/AppError';
import { TipoPerfil } from '@shared/enums';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { UsuarioRepository } from '@modules/usuarios/repositories/UsuarioRepository';
import { StartupRepository } from '@modules/startups/repositories/StartupRepository';
import { InvestidorRepository } from '@modules/investidores/repositories/InvestidorRepository';
import { ConversaRepository, ConversaResumo } from '@modules/conversas/repositories/ConversaRepository';
import { MensagemRepository, MensagemRegistro } from '@modules/mensagens/repositories/MensagemRepository';

export type MensagemResumo = MensagemRegistro;

export class MensagemService {
  usuarioRepository = new UsuarioRepository();
  startupRepository = new StartupRepository();
  investidorRepository = new InvestidorRepository();
  conversaRepository = new ConversaRepository();
  mensagemRepository = new MensagemRepository();

  // Dado o par de usuários (um precisa ser startup, o outro investidor), acha os ids de
  // perfil (Startup.id / Investidor.id) usados pela Conversa. Lança 403 se os dois forem
  // do mesmo tipo (startup-startup, investidor-investidor) ou se algum for admin.
  private async resolverPar(usuarioA: Usuario, usuarioB: Usuario): Promise<{ startupId: string; investidorId: string }> {
    const [startupUsuario, investidorUsuario] =
      usuarioA.tipoPerfil === TipoPerfil.STARTUP ? [usuarioA, usuarioB] : [usuarioB, usuarioA];
    if (startupUsuario.tipoPerfil !== TipoPerfil.STARTUP || investidorUsuario.tipoPerfil !== TipoPerfil.INVESTIDOR) {
      throw new AppError('Mensagens só podem ser trocadas entre uma startup e um investidor.', 403);
    }

    const startup = await this.startupRepository.findByUsuarioId(startupUsuario.id);
    const investidor = await this.investidorRepository.findByUsuarioId(investidorUsuario.id);
    if (!startup || !investidor) {
      throw new AppError('Perfil não encontrado.', 404);
    }
    return { startupId: startup.id, investidorId: investidor.id };
  }

  // Regra de negócio: só investidor pode iniciar uma conversa (criar a Conversa). A startup
  // só consegue responder depois que já existe uma conversa, ou seja, depois que um
  // investidor escreveu primeiro.
  async enviar(remetenteId: string, destinatarioId: unknown, conteudo: unknown): Promise<MensagemResumo> {
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
    if (remetente.tipoPerfil !== TipoPerfil.STARTUP && remetente.tipoPerfil !== TipoPerfil.INVESTIDOR) {
      throw new AppError('Este perfil não participa de conversas.', 403);
    }
    const destinatario = await this.usuarioRepository.findById(destinatarioId);
    if (!destinatario || !destinatario.ativo) {
      throw new AppError('Destinatário não encontrado.', 404);
    }

    const { startupId, investidorId } = await this.resolverPar(remetente, destinatario);

    let conversa = await this.conversaRepository.buscarPorPar(startupId, investidorId);
    if (!conversa) {
      if (remetente.tipoPerfil !== TipoPerfil.INVESTIDOR) {
        throw new AppError('Aguarde um investidor iniciar a conversa antes de enviar uma mensagem.', 403);
      }
      conversa = await this.conversaRepository.criar(startupId, investidorId);
    }

    const mensagem = await this.mensagemRepository.criar(conversa.id, remetenteId, texto);
    await this.conversaRepository.tocarUltimaMensagem(conversa.id, mensagem.enviadoEm);
    return mensagem;
  }

  async listarConversas(usuarioId: string): Promise<ConversaResumo[]> {
    return this.conversaRepository.listarResumoPorUsuario(usuarioId);
  }

  // Sem conversa ainda (nenhum investidor escreveu) devolve lista vazia, não erro:
  // é um estado normal (ex.: abrir o chat com alguém pela primeira vez).
  async listarConversaCom(usuarioId: string, outroUsuarioId: string): Promise<MensagemResumo[]> {
    const eu = await this.usuarioRepository.findById(usuarioId);
    if (!eu || !eu.ativo) {
      throw new AppError('Usuário inválido.', 401);
    }
    const outro = await this.usuarioRepository.findById(outroUsuarioId);
    if (!outro) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const { startupId, investidorId } = await this.resolverPar(eu, outro);
    const conversa = await this.conversaRepository.buscarPorPar(startupId, investidorId);
    if (!conversa) {
      return [];
    }

    await this.mensagemRepository.marcarComoLidas(conversa.id, usuarioId);
    return this.mensagemRepository.listarPorConversa(conversa.id);
  }
}
