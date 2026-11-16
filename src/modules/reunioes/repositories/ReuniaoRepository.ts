import { AppError } from '@shared/errors/AppError';
import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database/data-source';
import { Reuniao } from '@modules/reunioes/entities/Reuniao';
import { StatusReuniao } from '@shared/enums';

export class ReuniaoRepository {
  private get repository(): Repository<Reuniao> {
    return AppDataSource.getRepository(Reuniao);
  }

  async criar(
    startupId: string,
    investidorId: string,
    dataHoraAgendada: Date,
    linkReuniao?: string,
    notas?: string,
  ): Promise<Reuniao> {
    const reuniao = this.repository.create({
      startup: { id: startupId },
      investidor: { id: investidorId },
      dataHoraAgendada,
      linkReuniao,
      notas,
    } as Partial<Reuniao>);
    return this.repository.save(reuniao);
  }

  // Carrega startup/investidor (nome e id) para exibir e autorizar, mas nunca o usuario deles.
  async buscarPorId(id: string): Promise<Reuniao | null> {
    return this.repository.findOne({ where: { id }, relations: { startup: true, investidor: true } });
  }

  async listarPorStartup(startupId: string): Promise<Reuniao[]> {
    return this.repository.find({
      where: { startup: { id: startupId } },
      relations: { startup: true, investidor: true },
      order: { dataHoraAgendada: 'DESC' },
    });
  }

  async listarPorInvestidor(investidorId: string): Promise<Reuniao[]> {
    return this.repository.find({
      where: { investidor: { id: investidorId } },
      relations: { startup: true, investidor: true },
      order: { dataHoraAgendada: 'DESC' },
    });
  }

  async concluirVencidas(): Promise<void> {
    await AppDataSource.query(`UPDATE reunioes SET status='realizada'
      WHERE status='agendada' AND data_hora_agendada <= now()-interval '24 hours'`);
  }

  async atualizarStatus(id: string, status: StatusReuniao): Promise<void> {
    const result = await this.repository.createQueryBuilder().update(Reuniao).set({ status })
      .where("id = :id AND status = :agendada", { id, agendada: StatusReuniao.AGENDADA }).execute();
    if (!result.affected) throw new AppError('O status desta reunião já foi alterado. Atualize a página.', 409);
  }
}
