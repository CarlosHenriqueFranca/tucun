import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ConversationParticipantOrmEntity } from './conversation-participant.orm-entity';
import { MessageOrmEntity } from './message.orm-entity';

@Entity('conversations')
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ConversationParticipantOrmEntity, (p) => p.conversation)
  participants: ConversationParticipantOrmEntity[];

  @OneToMany(() => MessageOrmEntity, (m) => m.conversation)
  messages: MessageOrmEntity[];
}
