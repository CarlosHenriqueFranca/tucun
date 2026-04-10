import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EcoReportType {
  ILLEGAL_FISHING = 'illegal_fishing',
  POLLUTION = 'pollution',
  INVASIVE_SPECIES = 'invasive_species',
  DEFORESTATION = 'deforestation',
  OTHER = 'other',
}

export enum EcoReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

@Entity('eco_reports')
export class EcoReportOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: EcoReportType,
    default: EcoReportType.OTHER,
  })
  type: EcoReportType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'jsonb', default: [] })
  mediaUrls: string[];

  @Column({
    type: 'enum',
    enum: EcoReportStatus,
    default: EcoReportStatus.PENDING,
  })
  status: EcoReportStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
