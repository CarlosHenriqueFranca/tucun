export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type UserRole = 'user' | 'moderator' | 'admin';

export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash?: string;
  whatsapp?: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  state?: string;
  providersLinked?: string[];
  role?: UserRole;
}

export class UserEntity {
  readonly id: string;
  email: string;
  passwordHash: string | null;
  whatsapp: string | null;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;

  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  trialUsedAt: Date | null;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;

  role: UserRole;

  lastLoginAt: Date | null;
  loginCount: number;
  xpTotal: number;
  level: number;

  providersLinked: string[];

  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: CreateUserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash || null;
    this.whatsapp = props.whatsapp || null;
    this.name = props.name;
    this.username = props.username;
    this.avatarUrl = props.avatarUrl || null;
    this.bio = props.bio || null;
    this.city = props.city || null;
    this.state = props.state || null;

    this.subscriptionTier = 'free';
    this.subscriptionExpiresAt = null;
    this.trialUsedAt = null;

    this.isEmailVerified = false;
    this.isPhoneVerified = false;
    this.isActive = true;
    this.isBlocked = false;

    this.role = props.role || 'user';

    this.lastLoginAt = null;
    this.loginCount = 0;
    this.xpTotal = 0;
    this.level = 1;

    this.providersLinked = props.providersLinked || [];

    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  startTrial(): void {
    if (this.trialUsedAt) {
      return; // Trial already used
    }
    this.trialUsedAt = new Date();
  }

  isTrialActive(): boolean {
    if (!this.trialUsedAt) return false;
    const trialEnd = new Date(
      this.trialUsedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    return new Date() <= trialEnd;
  }

  hasActiveSubscription(): boolean {
    if (this.subscriptionTier === 'free') return this.isTrialActive();
    if (!this.subscriptionExpiresAt) return false;
    return this.subscriptionExpiresAt > new Date();
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    this.updatedAt = new Date();
  }

  addXp(amount: number): void {
    this.xpTotal += amount;
    this.level = this.calculateLevel(this.xpTotal);
    this.updatedAt = new Date();
  }

  private calculateLevel(xp: number): number {
    // Level up every 1000 XP, capped at 100
    return Math.min(Math.floor(xp / 1000) + 1, 100);
  }

  linkProvider(provider: string): void {
    if (!this.providersLinked.includes(provider)) {
      this.providersLinked.push(provider);
      this.updatedAt = new Date();
    }
  }

  toPublicProfile(): Partial<UserEntity> {
    return {
      id: this.id,
      name: this.name,
      username: this.username,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      city: this.city,
      state: this.state,
      xpTotal: this.xpTotal,
      level: this.level,
      createdAt: this.createdAt,
    };
  }
}
