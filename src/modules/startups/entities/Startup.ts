import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '@modules/usuarios/entities/Usuario';
import {
  Segmento,
  Estagio,
  Regiao,
  ModeloNegocio,
  StatusModeracao,
  MetricaCrescimento,
  PeriodoComparacao,
  NecessidadeAdicional,
} from '@shared/enums';

@Entity({ name: 'startups' })
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  // ---- Identidade / apresentação ----
  @Column({ name: 'nome_fantasia', type: 'varchar', length: 150 })
  nomeFantasia!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'apresentacao_url', type: 'text', nullable: true })
  apresentacaoUrl?: string;

  @Column({ name: 'descricao_curta', type: 'varchar', length: 300, nullable: true })
  descricaoCurta?: string;

  @Column({ name: 'site_url', type: 'varchar', length: 255, nullable: true })
  siteUrl?: string;

  // { linkedin?: string, instagram?: string, outros?: string[] }
  @Column({ name: 'links_sociais', type: 'jsonb', nullable: true })
  linksSociais?: { linkedin?: string; instagram?: string; outros?: string[] };

  @Column({ name: 'video_apresentacao_url', type: 'text', nullable: true })
  videoApresentacaoUrl?: string;

  // ---- Classificação (critérios de compatibilidade) ----
  @Column({ type: 'enum', enum: Segmento, enumName: 'segmento_enum' })
  segmento!: Segmento;

  @Column({
    name: 'segmentos_secundarios',
    type: 'enum',
    enum: Segmento,
    enumName: 'segmento_enum',
    array: true,
    default: '{}',
  })
  segmentosSecundarios!: Segmento[];

  @Column({ type: 'enum', enum: Estagio, enumName: 'estagio_enum' })
  estagio!: Estagio;

  @Column({
    name: 'modelo_negocio',
    type: 'enum',
    enum: ModeloNegocio,
    enumName: 'modelo_negocio_enum',
  })
  modeloNegocio!: ModeloNegocio;

  // ---- Localização ----
  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string; // UF de origem, ex: "PE"

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string; // cidade de origem

  @Column({
    name: 'regioes_atuacao',
    type: 'enum',
    enum: Regiao,
    enumName: 'regiao_enum',
    array: true,
    default: '{}',
  })
  regioesAtuacao!: Regiao[]; // usado no matching com investidores_interesse.regioes_interesse

  @Column({
    name: 'regioes_crescimento',
    type: 'enum',
    enum: Regiao,
    enumName: 'regiao_enum',
    array: true,
    default: '{}',
  })
  regioesCrescimento!: Regiao[]; // onde pretendem crescer

  @Column({ name: 'mercado_alvo', type: 'varchar', length: 200, nullable: true })
  mercadoAlvo?: string;

  // ---- Métricas de evolução do negócio ----
  @Column({
    name: 'metrica_crescimento',
    type: 'enum',
    enum: MetricaCrescimento,
    enumName: 'metrica_crescimento_enum',
    nullable: true,
  })
  metricaCrescimento?: MetricaCrescimento; // o que cresceu: receita, clientes, ambos

  @Column({
    name: 'periodo_comparacao_crescimento',
    type: 'enum',
    enum: PeriodoComparacao,
    enumName: 'periodo_comparacao_enum',
    nullable: true,
  })
  periodoComparacaoCrescimento?: PeriodoComparacao;

  @Column({ name: 'taxa_crescimento_pct', type: 'numeric', precision: 6, scale: 2, nullable: true })
  taxaCrescimentoPct?: number; // crescimento em %

  @Column({ name: 'descricao_evolucao', type: 'text', nullable: true })
  descricaoEvolucao?: string;

  @Column({ name: 'numero_clientes', type: 'integer', nullable: true })
  numeroClientes?: number;

  @Column({ name: 'faturamento_mensal', type: 'numeric', precision: 14, scale: 2, nullable: true })
  faturamentoMensal?: number;

  @Column({ name: 'tamanho_equipe', type: 'smallint', nullable: true })
  tamanhoEquipe?: number;

  // ---- Captação ----
  @Column({ name: 'busca_investimento', type: 'boolean', default: true })
  buscaInvestimento!: boolean;

  @Column({ name: 'capital_procurado', type: 'numeric', precision: 14, scale: 2, nullable: true })
  capitalProcurado?: number;

  @Column({ name: 'finalidade_investimento', type: 'text', nullable: true })
  finalidadeInvestimento?: string;

  @Column({
    name: 'necessidades_adicionais',
    type: 'enum',
    enum: NecessidadeAdicional,
    enumName: 'necessidade_adicional_enum',
    array: true,
    default: '{}',
  })
  necessidadesAdicionais!: NecessidadeAdicional[]; // "além de capital, o que mais procuram?"

  @Column({ name: 'descricao_pitch', type: 'text', nullable: true })
  descricaoPitch?: string;

  @Column({ name: 'canvas_json', type: 'jsonb', nullable: true })
  canvasJson?: Record<string, unknown>;

  @Column({
    name: 'status_moderacao',
    type: 'enum',
    enum: StatusModeracao,
    enumName: 'status_moderacao_enum',
    default: StatusModeracao.PENDENTE,
  })
  statusModeracao!: StatusModeracao;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm!: Date;
}