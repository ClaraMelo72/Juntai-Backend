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
  TipoInvestidor,
  PerfilRisco,
  Segmento,
  Estagio,
  Regiao,
  ModeloNegocio,
  StatusModeracao,
  AreaAjuda,
  DisponibilidadeInvestidor,
} from '@shared/enums';

@Entity({ name: 'investidores' })
export class Investidor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  // ---- Identidade / apresentação ----
  @Column({ type: 'varchar', length: 150 })
  nome!: string;

  @Column({ name: 'titulo_profissional', type: 'varchar', length: 150, nullable: true })
  tituloProfissional?: string; // ex: "Sócio na XPTO Ventures"

  @Column({ name: 'linkedin_url', type: 'varchar', length: 255, nullable: true })
  linkedinUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  // ---- Localização ----
  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string;

  // ---- Perfil de atuação ----
  @Column({
    name: 'tipo_investidor',
    type: 'enum',
    enum: TipoInvestidor,
    enumName: 'tipo_investidor_enum',
    default: TipoInvestidor.ANJO,
  })
  tipoInvestidor!: TipoInvestidor;

  @Column({
    name: 'areas_ajuda',
    type: 'enum',
    enum: AreaAjuda,
    enumName: 'area_ajuda_enum',
    array: true,
    default: '{}',
  })
  areasAjuda!: AreaAjuda[]; // "em quais áreas pode ajudar uma startup?"

  @Column({
    type: 'enum',
    enum: DisponibilidadeInvestidor,
    enumName: 'disponibilidade_investidor_enum',
    nullable: true,
  })
  disponibilidade?: DisponibilidadeInvestidor; // "quanto tempo pode dedicar?"

  // ---- Experiência prévia ----
  @Column({ name: 'ja_atuou_com_startups', type: 'boolean', default: false })
  jaAtuouComStartups!: boolean;

  @Column({ name: 'numero_aproximado_investimentos', type: 'smallint', nullable: true })
  numeroAproximadoInvestimentos?: number;

  @Column({ name: 'descricao_experiencia', type: 'text', nullable: true })
  descricaoExperiencia?: string;

  @Column({
    name: 'setores_atuacao',
    type: 'enum',
    enum: Segmento,
    enumName: 'segmento_enum',
    array: true,
    default: '{}',
  })
  setoresAtuacao!: Segmento[]; // setores em que já atuou (histórico), != segmentos_interesse (preferência futura)

  @Column({ name: 'anos_experiencia', type: 'smallint', nullable: true })
  anosExperiencia?: number;

  // ---- Critérios de investimento (preferências multivaloradas -> array de ENUM) ----
  @Column({ name: 'ticket_minimo', type: 'numeric', precision: 14, scale: 2, nullable: true })
  ticketMinimo?: number;

  @Column({ name: 'ticket_maximo', type: 'numeric', precision: 14, scale: 2, nullable: true })
  ticketMaximo?: number;

  @Column({
    name: 'perfil_risco',
    type: 'enum',
    enum: PerfilRisco,
    enumName: 'perfil_risco_enum',
    nullable: true,
  })
  perfilRisco?: PerfilRisco;

  @Column({
    name: 'segmentos_interesse',
    type: 'enum',
    enum: Segmento,
    enumName: 'segmento_enum',
    array: true,
    default: '{}',
  })
  segmentosInteresse!: Segmento[];

  @Column({
    name: 'estagios_interesse',
    type: 'enum',
    enum: Estagio,
    enumName: 'estagio_enum',
    array: true,
    default: '{}',
  })
  estagiosInteresse!: Estagio[];

  @Column({
    name: 'regioes_interesse',
    type: 'enum',
    enum: Regiao,
    enumName: 'regiao_enum',
    array: true,
    default: '{}',
  })
  regioesInteresse!: Regiao[];

  @Column({
    name: 'modelos_interesse',
    type: 'enum',
    enum: ModeloNegocio,
    enumName: 'modelo_negocio_enum',
    array: true,
    default: '{}',
  })
  modelosInteresse!: ModeloNegocio[];

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