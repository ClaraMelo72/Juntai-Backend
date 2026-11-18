import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';

export type TipoAlvoModeracao = 'mensagem' | 'avaliacao' | 'startup' | 'investidor';
export type StatusDenuncia = 'pendente' | 'em_analise' | 'resolvida' | 'rejeitada';

@Entity({ name: 'denuncias' })
export class Denuncia {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Usuario, { nullable: false }) @JoinColumn({ name: 'denunciante_usuario_id' }) denuncianteUsuario!: Usuario;
  @ManyToOne(() => Usuario, { nullable: true }) @JoinColumn({ name: 'denunciado_usuario_id' }) denunciadoUsuario?: Usuario;
  @Column({ name: 'tipo_alvo', type: 'text' }) tipoAlvo!: TipoAlvoModeracao;
  @Column({ name: 'alvo_id', type: 'varchar', length: 36 }) alvoId!: string;
  @Column({ name: 'campo_alvo', type: 'varchar', length: 100, nullable: true }) campoAlvo?: string;
  // A lista definitiva de motivos depende da politica aprovada pela equipe.
  @Column({ type: 'varchar', length: 100 }) motivo!: string;
  @Column({ type: 'text', nullable: true }) descricao?: string;
  @Column({ type: 'text', default: 'pendente' }) status!: StatusDenuncia;
  @CreateDateColumn({ name: 'criada_em', type: 'timestamptz' }) criadaEm!: Date;
  @Column({ name: 'analisada_em', type: 'timestamptz', nullable: true }) analisadaEm?: Date;
  @ManyToOne(() => Usuario, { nullable: true }) @JoinColumn({ name: 'admin_usuario_id' }) adminUsuario?: Usuario;
  @Column({ name: 'justificativa_decisao', type: 'text', nullable: true }) justificativaDecisao?: string;
  @Column({ name: 'evidencia_ref', type: 'text', nullable: true }) evidenciaRef?: string;
  @Column({ name: 'analise_ia_considerada_id', type: 'uuid', nullable: true }) analiseIaConsideradaId?: string;
  @Column({ name: 'concordancia_ia', type: 'text', nullable: true }) concordanciaIa?: 'concorda' | 'discorda' | 'parcial';
}
