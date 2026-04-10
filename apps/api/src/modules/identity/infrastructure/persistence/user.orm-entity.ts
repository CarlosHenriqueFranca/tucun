import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  id: string;

  @Column({ type: 'varchar', length: 254, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'password_hash' })
  passwordHash: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  whatsapp: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true, default: 'RO' })
  state: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'free',
    name: 'subscription_tier',
  })
  subscriptionTier: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'subscription_expires_at' })
  subscriptionExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'trial_used_at' })
  trialUsedAt: Date | null;

  @Column({ type: 'boolean', default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_phone_verified' })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_blocked' })
  isBlocked: boolean;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @Column({ type: 'int', default: 0, name: 'login_count' })
  loginCount: number;

  @Column({ type: 'int', default: 0, name: 'xp_total' })
  xpTotal: number;

  @Index()
  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({
    type: 'jsonb',
    default: '[]',
    name: 'providers_linked',
    transformer: {
      to: (value: string[]) => value || [],
      from: (value: unknown) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try { return JSON.parse(value); } catch { return [value]; }
        }
        return [];
      },
    },
  })
  providersLinked: string[];

  @Column({ type: 'varchar', nullable: true, name: 'google_id', unique: true })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'facebook_id', unique: true })
  facebookId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'asaas_customer_id' })
  asaasCustomerId: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
