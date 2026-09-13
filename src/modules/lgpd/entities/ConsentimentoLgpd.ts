import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';

@Entity({ name: 'consentimentos_lgpd' })
export class ConsentimentoLgpd {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ name: 'versao_termos', type: 'varchar', length: 20 })
  versaoTermos!: string;

  @CreateDateColumn({ name: 'aceito_em', type: 'timestamptz' })
  aceitoEm!: Date;

  @Column({ name: 'ip_origem', type: 'inet', nullable: true })
  ipOrigem?: string;
}
