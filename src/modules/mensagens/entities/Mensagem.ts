import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';

@Entity({ name: 'mensagens' })
export class Mensagem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'remetente_usuario_id' })
  remetente!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'destinatario_usuario_id' })
  destinatario!: Usuario;

  @Column({ type: 'text' })
  conteudo!: string;

  @CreateDateColumn({ name: 'enviado_em', type: 'timestamptz' })
  enviadoEm!: Date;

  @Column({ name: 'lido_em', type: 'timestamptz', nullable: true })
  lidoEm?: Date;
}
