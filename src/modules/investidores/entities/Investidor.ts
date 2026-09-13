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
} from '@shared/enums';

@Entity({ name: 'investidores' })
export class Investidor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'varchar', length: 150 })
  nome!: string;

  @Column({
    name: 'tipo_investidor',
    type: 'enum',
    enum: TipoInvestidor,
    enumName: 'tipo_investidor_enum',
    default: TipoInvestidor.ANJO,
  })
  tipoInvestidor!: TipoInvestidor;

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

  @Column({ name: 'anos_experiencia', type: 'smallint', nullable: true })
  anosExperiencia?: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  // Preferências multivaloradas -> array do próprio ENUM (sem tabela de junção)
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