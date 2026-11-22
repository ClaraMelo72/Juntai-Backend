import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '@shared/errors/AppError';
import { MidiaDenunciada } from './AlvoDenunciaService';

export class EvidenciaService {
  async acessar(denunciaId: string, referencia: string): Promise<{
    disponivel: boolean;
    url?: string;
    expiraEm?: Date;
  }> {
    const assetId = /^cloudinary:([a-zA-Z0-9_-]+)$/.exec(referencia)?.[1];
    if (!assetId || !process.env.CLOUDINARY_URL) return { disponivel: false };
    try {
      cloudinary.config({ secure: true });
      const { resources } = await cloudinary.api.resources_by_asset_ids([assetId], { timeout: 5000 });
      const [asset] = resources;
      if (!asset || asset.asset_id !== assetId || asset.type !== 'authenticated') return { disponivel: false };

      const publicId = `juntai/moderacao/evidencias/${denunciaId}`;
      const raw = asset.resource_type === 'raw';
      const extensao = raw ? /\.(pdf|ppt|pptx)$/i.exec(asset.public_id)?.[1] : asset.format;
      if (!extensao || (raw
        ? asset.public_id !== `${publicId}.${extensao}`
        : asset.resource_type !== 'image' || asset.public_id !== publicId))
        return { disponivel: false };

      const expiresAt = Math.floor(Date.now() / 1000) + 300;
      const url = cloudinary.utils.private_download_url(asset.public_id, extensao, {
        expires_at: expiresAt, resource_type: raw ? 'raw' : 'image', type: 'authenticated', attachment: true,
      });
      return { disponivel: true, url, expiraEm: new Date(expiresAt * 1000) };
    } catch {
      return { disponivel: false };
    }
  }

  async preservar(denunciaId: string, midia: MidiaDenunciada): Promise<string> {
    if (!process.env.CLOUDINARY_URL)
      throw new AppError('O armazenamento de evidências está indisponível.', 503);

    const config = cloudinary.config({ secure: true });
    const prefixo = `https://res.cloudinary.com/${config.cloud_name}/${midia.tipo}/upload/`;
    const pasta = midia.pasta + '/';
    const caminho = midia.url.startsWith(prefixo) ? midia.url.slice(prefixo.length) : '';
    const versao = /^v[1-9]\d*\//.exec(caminho)?.[0];
    const arquivo = versao && caminho.slice(versao.length);
    const nome = arquivo && arquivo.startsWith(pasta) ? arquivo.slice(pasta.length) : '';
    const extensoes = midia.tipo === 'raw' ? 'pdf|ppt|pptx' : 'png|jpg|jpeg|webp';
    if (!new RegExp(`^[0-9a-f-]{36}\\.(${extensoes})$`, 'i').test(nome))
      throw new AppError('O arquivo não pode ser preservado como evidência.', 422);

    const publicIdOriginal = midia.tipo === 'image' ? arquivo!.split('.')[0] : arquivo!;
    const publicIdEvidencia = this.identificador(denunciaId, midia);
    let gravacaoIniciada = false;
    try {
      const original = await cloudinary.api.resource(publicIdOriginal, {
        resource_type: midia.tipo, type: 'upload', timeout: 5000,
      });
      if (original.secure_url !== midia.url)
        throw new AppError('A versão do arquivo não pode ser preservada como evidência.', 422);

      gravacaoIniciada = true;
      const copia = await cloudinary.uploader.upload(original.secure_url, {
        public_id: publicIdEvidencia,
        resource_type: midia.tipo,
        type: 'authenticated',
        overwrite: false,
        timeout: 15000,
      });
      if (!copia.asset_id || copia.type !== 'authenticated' || copia.public_id !== publicIdEvidencia)
        throw new AppError('Não foi possível preservar a evidência de forma restrita.', 502);
      return `cloudinary:${copia.asset_id}`;
    } catch (error) {
      if (gravacaoIniciada) await this.descartar(denunciaId, midia);
      if (error instanceof AppError) throw error;
      throw new AppError('Não foi possível preservar o arquivo denunciado.', 502);
    }
  }

  async descartar(denunciaId: string, midia: MidiaDenunciada): Promise<void> {
    try {
      const opcoes = {
        resource_type: midia.tipo, type: 'authenticated', timeout: 5000,
      } as const;
      await cloudinary.uploader.destroy(this.identificador(denunciaId, midia), opcoes);
    } catch {
      console.error('Falha ao descartar cópia de evidência', { denunciaId });
    }
  }

  private identificador(denunciaId: string, midia: MidiaDenunciada): string {
    const extensao = midia.tipo === 'raw' ? midia.url.slice(midia.url.lastIndexOf('.')) : '';
    return `juntai/moderacao/evidencias/${denunciaId}${extensao}`;
  }
}
