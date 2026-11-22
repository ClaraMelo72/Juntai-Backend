import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import { Denuncia } from './Denuncia';

@Entity({ name: 'sancoes' })
export class Sancao {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Usuario, { nullable: false }) @JoinColumn({ name: 'usuario_id' }) usuario!: Usuario;
  @ManyToOne(() => Denuncia, { nullable: true }) @JoinColumn({ name: 'denuncia_id' }) denuncia?: Denuncia;
  @Column({ type: 'text' }) tipo!: 'advertencia' | 'restricao_chat' | 'suspensao' | 'banimento';
  @Column({ type: 'text' }) motivo!: string;
  @Column({ name: 'inicio_em', type: 'timestamptz', default: () => 'now()' }) inicioEm!: Date;
  @Column({ name: 'fim_em', type: 'timestamptz', nullable: true }) fimEm?: Date;
  @ManyToOne(() => Usuario, { nullable: false }) @JoinColumn({ name: 'admin_usuario_id' }) adminUsuario!: Usuario;
  @Column({ name: 'revogada_em', type: 'timestamptz', nullable: true }) revogadaEm?: Date;
  @ManyToOne(() => Usuario, { nullable: true }) @JoinColumn({ name: 'revogada_por_usuario_id' }) revogadaPorUsuario?: Usuario;
  @Column({ name: 'justificativa_revogacao', type: 'text', nullable: true }) justificativaRevogacao?: string;
}
