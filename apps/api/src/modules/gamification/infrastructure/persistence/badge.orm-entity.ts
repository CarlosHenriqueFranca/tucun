import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  SPECIAL = 'special',
}

export enum BadgeCategory {
  FISHING = 'fishing',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  CONSERVATION = 'conservation',
  ACHIEVEMENT = 'achievement',
  SPECIAL = 'special',
}

@Entity('badges')
export class BadgeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'enum', enum: BadgeRarity })
  rarity: BadgeRarity;

  @Column({ type: 'enum', enum: BadgeCategory })
  category: BadgeCategory;

  @Column({ type: 'int', default: 0 })
  xpRequired: number;

  @Column({ type: 'text', nullable: true })
  conditionType: string | null;

  @Column({ type: 'jsonb', nullable: true })
  conditionValue: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
