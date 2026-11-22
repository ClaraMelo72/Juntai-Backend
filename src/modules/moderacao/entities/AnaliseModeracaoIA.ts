import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Denuncia } from './Denuncia';

@Entity({ name: 'analises_moderacao_ia' })
export class AnaliseModeracaoIA {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Denuncia, { nullable: false }) @JoinColumn({ name: 'denuncia_id' }) denuncia!: Denuncia;
  @Column({ type: 'text', default: 'pendente' }) status!: 'pendente' | 'processando' | 'concluida' | 'falhou';
  @Column({ name: 'categoria_prevista', type: 'text', nullable: true }) categoriaPrevista?: 'assedio_ameaca' | 'spam' | 'possivel_fraude' | 'conteudo_improprio' | 'sem_violacao_identificada' | 'insuficiente';
  @Column({ type: 'text', nullable: true }) prioridade?: 'baixa' | 'media' | 'alta';
  // pg retorna numeric como string para preservar precisao.
  @Column({ name: 'score_risco', type: 'numeric', precision: 5, scale: 4, nullable: true }) scoreRisco?: string;
  @Column({ type: 'text', nullable: true }) justificativa?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) modelo?: string;
  @Column({ name: 'versao_modelo', type: 'varchar', length: 100, nullable: true }) versaoModelo?: string;
  @Column({ name: 'politica_versao', type: 'varchar', length: 100 }) politicaVersao!: string;
  @Column({ name: 'evidencia_referencia', type: 'text', nullable: true }) evidenciaReferencia?: string;
  @Column({ name: 'trecho_referencia', type: 'text', nullable: true }) trechoReferencia?: string;
  @Column({ name: 'erro_codigo', type: 'varchar', length: 100, nullable: true }) erroCodigo?: string;
  @CreateDateColumn({ name: 'criada_em', type: 'timestamptz' }) criadaEm!: Date;
  @Column({ name: 'concluida_em', type: 'timestamptz', nullable: true }) concluidaEm?: Date;
  @Column({ name: 'duracao_ms', type: 'integer', nullable: true }) duracaoMs?: number;
}
