import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Startup } from '@modules/startups/entities/Startup';
import { Investidor } from '@modules/investidores/entities/Investidor';
import { StatusReuniao } from '@shared/enums';

@Entity({ name: 'reunioes' })
export class Reuniao {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Startup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  startup!: Startup;

  @ManyToOne(() => Investidor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investidor_id' })
  investidor!: Investidor;

  @Column({ name: 'data_hora_agendada', type: 'timestamptz' })
  dataHoraAgendada!: Date;

  @Column({
    type: 'enum',
    enum: StatusReuniao,
    enumName: 'status_reuniao_enum',
    default: StatusReuniao.AGENDADA,
  })
  status!: StatusReuniao;

  @Column({ name: 'link_reuniao', type: 'varchar', length: 255, nullable: true })
  linkReuniao?: string;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;
}
