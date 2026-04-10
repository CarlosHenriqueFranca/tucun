import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('stories')
export class StoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  mediaUrl: string;

  @Column({ type: 'varchar', length: 10 })
  mediaType: 'image' | 'video';

  @Column({ type: 'text', nullable: true })
  caption: string | null;

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({
    type: 'timestamptz',
    default: () => "NOW() + INTERVAL '24 hours'",
  })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
