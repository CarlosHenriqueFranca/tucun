import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConservationStatus {
  LEAST_CONCERN = 'least_concern',
  NEAR_THREATENED = 'near_threatened',
  VULNERABLE = 'vulnerable',
  ENDANGERED = 'endangered',
  CRITICALLY_ENDANGERED = 'critically_endangered',
}

@Entity('fish_species')
export class FishSpeciesOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  scientificName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  habitat: string;

  @Column({ type: 'text' })
  diet: string;

  @Column({
    type: 'enum',
    enum: ConservationStatus,
    default: ConservationStatus.LEAST_CONCERN,
  })
  conservationStatus: ConservationStatus;

  @Column({ type: 'int' })
  minSizeCm: number;

  @Column({ type: 'int' })
  maxSizeCm: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  minWeightKg: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  maxWeightKg: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'boolean', default: false })
  isEndemic: boolean;

  @Column({ type: 'boolean', default: false })
  isProtectedInRondonia: boolean;

  @Column({ type: 'jsonb', default: [] })
  bestSeason: number[]; // month numbers 1-12

  @Column({ type: 'jsonb', default: [] })
  techniques: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
