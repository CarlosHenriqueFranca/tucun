import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FishingSpotOrmEntity } from './fishing-spot.orm-entity';

@Entity('spot_ratings')
@Unique(['spotId', 'userId'])
export class SpotRatingOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  spotId: string;

  @ManyToOne(() => FishingSpotOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spot_id' })
  spot: FishingSpotOrmEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
