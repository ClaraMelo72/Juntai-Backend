import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Investidor } from '@modules/investidores/entities/Investidor';
import { Segmento } from '@shared/enums';

// Sinal de experiência/afinidade por segmento do investidor.
// Campo explicitamente sugerido no item 3 do doc. de IA para o perfil do investidor.
@Entity({ name: 'historico_investimentos' })
export class HistoricoInvestimento {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Investidor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investidor_id' })
  investidor!: Investidor;

  @Column({
    type: 'enum',
    enum: Segmento,
    enumName: 'segmento_enum',
    nullable: true,
  })
  segmento?: Segmento;

  @Column({ name: 'nome_empresa', type: 'varchar', length: 150, nullable: true })
  nomeEmpresa?: string;

  @Column({ name: 'valor_investido', type: 'numeric', precision: 14, scale: 2, nullable: true })
  valorInvestido?: number;

  @Column({ name: 'data_investimento', type: 'date', nullable: true })
  dataInvestimento?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;
}
