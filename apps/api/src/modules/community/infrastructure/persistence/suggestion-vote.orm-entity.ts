import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SuggestionOrmEntity } from './suggestion.orm-entity';

@Entity('suggestion_votes')
@Unique(['suggestionId', 'userId'])
export class SuggestionVoteOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  suggestionId: string;

  @ManyToOne(() => SuggestionOrmEntity, (s) => s.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'suggestion_id' })
  suggestion: SuggestionOrmEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
