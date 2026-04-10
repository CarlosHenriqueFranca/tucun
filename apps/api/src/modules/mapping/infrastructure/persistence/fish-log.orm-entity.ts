import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FishingSpotOrmEntity } from './fishing-spot.orm-entity';

@Entity('fish_logs')
export class FishLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  speciesId: string;

  @Column({ type: 'uuid', nullable: true })
  spotId: string | null;

  @ManyToOne(() => FishingSpotOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'spot_id' })
  spot: FishingSpotOrmEntity | null;

  @Column({ type: 'int', nullable: true })
  sizeCm: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  weightKg: number | null;

  @Column({ type: 'boolean', default: true })
  wasReleased: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  caughtAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
