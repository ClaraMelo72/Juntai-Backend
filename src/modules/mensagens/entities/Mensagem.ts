import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Conversa } from '@modules/conversas/entities/Conversa';

@Entity({ name: 'mensagens' })
export class Mensagem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Conversa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversa_id' })
  conversa!: Conversa;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'remetente_usuario_id' })
  remetente!: Usuario;
  // destinatário não é mais coluna própria: é "o outro participante da conversa"
  // (o usuário da Startup ou do Investidor que não for o remetente).

  @Column({ type: 'text' })
  conteudo!: string;

  @CreateDateColumn({ name: 'enviado_em', type: 'timestamptz' })
  enviadoEm!: Date;

  @Column({ name: 'lido_em', type: 'timestamptz', nullable: true })
  lidoEm?: Date;
}