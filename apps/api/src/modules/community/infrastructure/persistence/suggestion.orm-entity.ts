import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SuggestionVoteOrmEntity } from './suggestion-vote.orm-entity';

export enum SuggestionCategory {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  OTHER = 'other',
}

export enum SuggestionStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  PLANNED = 'planned',
  IMPLEMENTED = 'implemented',
  REJECTED = 'rejected',
}

@Entity('suggestions')
export class SuggestionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SuggestionCategory,
    default: SuggestionCategory.FEATURE,
  })
  category: SuggestionCategory;

  @Column({
    type: 'enum',
    enum: SuggestionStatus,
    default: SuggestionStatus.OPEN,
  })
  status: SuggestionStatus;

  @Column({ type: 'timestamptz' })
  votingEndsAt: Date;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'text', nullable: true })
  devComment: string | null;

  @Column({ type: 'boolean', default: false })
  devCommentIsPublic: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SuggestionVoteOrmEntity, (v) => v.suggestion)
  votes: SuggestionVoteOrmEntity[];
}
