import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AlertCategory {
  PEDRA = 'pedra',
  BANCO_AREIA = 'banco_areia',
  FURTO = 'furto',
  HOSPITAL = 'hospital',
  POLICIA = 'policia',
  HOTEL = 'hotel',
  GASOLINA = 'gasolina',
  CACHOEIRA = 'cachoeira',
  CORREDEIRA = 'corredeira',
  OUTROS = 'outros',
}

export enum DangerLevel {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('route_alerts')
export class RouteAlertOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AlertCategory })
  category: AlertCategory;

  @Column({ type: 'enum', enum: DangerLevel })
  dangerLevel: DangerLevel;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'int', default: 100 })
  radius: number;

  @Column({ type: 'uuid' })
  reportedById: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  downvotes: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
