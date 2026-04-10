import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FishingSpotOrmEntity } from './fishing-spot.orm-entity';

export enum ChecklistCategory {
  ACCESS = 'access',
  SAFETY = 'safety',
  FACILITIES = 'facilities',
  ENVIRONMENT = 'environment',
}

@Entity('spot_checklist')
export class SpotChecklistOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  spotId: string;

  @ManyToOne(() => FishingSpotOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spot_id' })
  spot: FishingSpotOrmEntity;

  @Column({ type: 'enum', enum: ChecklistCategory })
  category: ChecklistCategory;

  @Column({ type: 'text' })
  item: string;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
