import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Startup } from '@modules/startups/entities/Startup';
import { Investidor } from '@modules/investidores/entities/Investidor';

// Uma conversa = uma thread entre uma Startup e um Investidor.
// Só existe UMA conversa por par (Unique abaixo) — toda mensagem trocada
// entre os dois cai aqui dentro, igual ao chat do Instagram/LinkedIn.
@Entity({ name: 'conversas' })
@Unique(['startup', 'investidor'])
export class Conversa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Startup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  startup!: Startup;

  @ManyToOne(() => Investidor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investidor_id' })
  investidor!: Investidor;

  @CreateDateColumn({ name: 'criada_em', type: 'timestamptz' })
  criadaEm!: Date;

  // Atualizado toda vez que uma mensagem nova chega -> usado pra ordenar
  // a lista de conversas igual um app de chat de verdade faz.
  @Column({ name: 'ultima_mensagem_em', type: 'timestamptz', nullable: true })
  ultimaMensagemEm?: Date;
}