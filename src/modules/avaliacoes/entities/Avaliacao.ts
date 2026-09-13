import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reuniao } from '@modules/reunioes/entities/Reuniao';
import { Usuario } from '@modules/usuarios/entities/Usuario';

@Entity({ name: 'avaliacoes' })
export class Avaliacao {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Reuniao, { nullable: true })
  @JoinColumn({ name: 'reuniao_id' })
  reuniao?: Reuniao;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'avaliador_usuario_id' })
  avaliador!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'avaliado_usuario_id' })
  avaliado!: Usuario;

  @Column({ type: 'smallint' })
  nota!: number; // 1 a 5 - validar no service/DTO antes de salvar

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;
}
