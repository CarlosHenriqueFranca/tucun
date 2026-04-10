import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BadgeOrmEntity } from './badge.orm-entity';

@Entity('user_badges')
@Unique(['userId', 'badgeId'])
export class UserBadgeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  badgeId: string;

  @ManyToOne(() => BadgeOrmEntity, { eager: true })
  @JoinColumn({ name: 'badge_id' })
  badge: BadgeOrmEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  awardedAt: Date;

  @Column({ type: 'boolean', default: true })
  isNew: boolean;
}
