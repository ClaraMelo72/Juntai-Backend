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
} from '@shared/enums';

@Entity({ name: 'startups' })
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ name: 'nome_fantasia', type: 'varchar', length: 150 })
  nomeFantasia!: string;

  @Column({ type: 'enum', enum: Segmento, enumName: 'segmento_enum' })
  segmento!: Segmento;

  @Column({ type: 'enum', enum: Estagio, enumName: 'estagio_enum' })
  estagio!: Estagio;

  @Column({ type: 'enum', enum: Regiao, enumName: 'regiao_enum' })
  regiao!: Regiao;

  @Column({
    name: 'modelo_negocio',
    type: 'enum',
    enum: ModeloNegocio,
    enumName: 'modelo_negocio_enum',
  })
  modeloNegocio!: ModeloNegocio;

  @Column({ name: 'mercado_alvo', type: 'varchar', length: 200, nullable: true })
  mercadoAlvo?: string;

  @Column({ name: 'numero_clientes', type: 'integer', nullable: true })
  numeroClientes?: number;

  @Column({ name: 'faturamento_mensal', type: 'numeric', precision: 14, scale: 2, nullable: true })
  faturamentoMensal?: number;

  @Column({ name: 'taxa_crescimento_pct', type: 'numeric', precision: 6, scale: 2, nullable: true })
  taxaCrescimentoPct?: number;

  @Column({ name: 'capital_procurado', type: 'numeric', precision: 14, scale: 2 })
  capitalProcurado!: number;

  @Column({ name: 'finalidade_investimento', type: 'text', nullable: true })
  finalidadeInvestimento?: string;

  @Column({ name: 'tamanho_equipe', type: 'smallint', nullable: true })
  tamanhoEquipe?: number;

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