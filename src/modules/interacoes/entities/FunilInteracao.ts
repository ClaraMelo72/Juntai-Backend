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
import { TipoEventoFunil } from '@shared/enums';

// Essa tabela é a base do "plano de coleta futura" pedido pela disciplina
// de IA (item 12): cada linha é um degrau do funil (visualização -> ... ->
// investimento_realizado). Sem ela não existe histórico pra construir o
// target de "match bem-sucedido" no futuro (item 11).
@Entity({ name: 'funil_interacoes' })
export class FunilInteracao {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Startup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  startup!: Startup;

  @ManyToOne(() => Investidor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investidor_id' })
  investidor!: Investidor;

  @Column({
    name: 'tipo_evento',
    type: 'enum',
    enum: TipoEventoFunil,
    enumName: 'tipo_evento_funil_enum',
  })
  tipoEvento!: TipoEventoFunil;

  @CreateDateColumn({ name: 'ocorrido_em', type: 'timestamptz' })
  ocorridoEm!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadados?: Record<string, unknown>;
}
