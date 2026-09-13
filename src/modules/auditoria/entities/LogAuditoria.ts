import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { AcaoAuditoria } from '@shared/enums';

@Entity({ name: 'log_auditoria' })
export class LogAuditoria {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'admin_usuario_id' })
  adminUsuario!: Usuario;

  @Column({
    type: 'enum',
    enum: AcaoAuditoria,
    enumName: 'acao_auditoria_enum',
  })
  acao!: AcaoAuditoria;

  @Column({ name: 'entidade_tipo', type: 'varchar', length: 30 })
  entidadeTipo!: string;

  @Column({ name: 'entidade_id', type: 'uuid', nullable: true })
  entidadeId?: string;

  @Column({ type: 'jsonb', nullable: true })
  detalhes?: Record<string, unknown>;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;
}
