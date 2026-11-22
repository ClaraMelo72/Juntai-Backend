import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Denuncia } from './Denuncia';
import { Usuario } from '@modules/usuarios/entities/Usuario';

// Controle por campo; o conteudo original permanece na entidade de perfil.
@Entity({ name: 'campos_perfil_ocultados' })
export class CampoPerfilOcultado {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tipo_alvo', type: 'text' }) tipoAlvo!: 'startup' | 'investidor';
  @Column({ name: 'alvo_id', type: 'uuid' }) alvoId!: string;
  @Column({ name: 'campo_alvo', type: 'varchar', length: 100 }) campoAlvo!: string;
  @ManyToOne(() => Denuncia, { nullable: true }) @JoinColumn({ name: 'denuncia_id' }) denuncia?: Denuncia;
  @ManyToOne(() => Usuario, { nullable: false }) @JoinColumn({ name: 'admin_usuario_id' }) adminUsuario!: Usuario;
  @CreateDateColumn({ name: 'ocultado_em', type: 'timestamptz' }) ocultadoEm!: Date;
  @Column({ name: 'restaurado_em', type: 'timestamptz', nullable: true }) restauradoEm?: Date;
}
