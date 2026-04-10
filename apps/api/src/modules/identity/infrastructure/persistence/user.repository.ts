import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  IUserRepository,
  FindManyOptions,
  PaginatedResult,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({
      where: { username: username.toLowerCase() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByWhatsapp(whatsapp: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { whatsapp } });
    return orm ? this.toDomain(orm) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const orm = this.toOrm(user);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const orm = this.toOrm(user);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { username: username.toLowerCase() },
    });
    return count > 0;
  }

  async existsByWhatsapp(whatsapp: string): Promise<boolean> {
    const count = await this.repo.count({ where: { whatsapp } });
    return count > 0;
  }

  async findFollowers(
    userId: string,
    options: FindManyOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const [rows, total] = await this.dataSource.query(
      `SELECT u.*, COUNT(*) OVER() AS total_count
       FROM users u
       INNER JOIN follows f ON f.follower_id = u.id
       WHERE f.following_id = $1
         AND u.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const items = (rows as UserOrmEntity[]).map((r) => this.toDomain(r));
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFollowing(
    userId: string,
    options: FindManyOptions = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const [rows, total] = await this.dataSource.query(
      `SELECT u.*, COUNT(*) OVER() AS total_count
       FROM users u
       INNER JOIN follows f ON f.following_id = u.id
       WHERE f.follower_id = $1
         AND u.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const items = (rows as UserOrmEntity[]).map((r) => this.toDomain(r));
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (follower_id, following_id) DO NOTHING`,
      [followerId, followingId],
    );
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId],
    );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
      [followerId, followingId],
    );
    return result.length > 0;
  }

  private toDomain(orm: UserOrmEntity): UserEntity {
    const entity = new UserEntity({
      id: orm.id,
      email: orm.email || '',
      passwordHash: orm.passwordHash || undefined,
      whatsapp: orm.whatsapp || undefined,
      name: orm.name,
      username: orm.username,
      avatarUrl: orm.avatarUrl || undefined,
      bio: orm.bio || undefined,
      city: orm.city || undefined,
      state: orm.state || undefined,
      providersLinked: orm.providersLinked || [],
      role: orm.role as 'user' | 'moderator' | 'admin',
    });

    entity.subscriptionTier = orm.subscriptionTier as 'free' | 'basic' | 'premium';
    entity.subscriptionExpiresAt = orm.subscriptionExpiresAt;
    entity.trialUsedAt = orm.trialUsedAt;
    entity.isEmailVerified = orm.isEmailVerified;
    entity.isPhoneVerified = orm.isPhoneVerified;
    entity.isActive = orm.isActive;
    entity.isBlocked = orm.isBlocked;
    entity.lastLoginAt = orm.lastLoginAt;
    entity.loginCount = orm.loginCount;
    entity.xpTotal = orm.xpTotal;
    entity.level = orm.level;

    // Bypass readonly for persisted dates
    Object.assign(entity, {
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });

    return entity;
  }

  private toOrm(entity: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = entity.id;
    orm.email = entity.email;
    orm.passwordHash = entity.passwordHash;
    orm.whatsapp = entity.whatsapp;
    orm.name = entity.name;
    orm.username = entity.username;
    orm.avatarUrl = entity.avatarUrl;
    orm.bio = entity.bio;
    orm.city = entity.city;
    orm.state = entity.state;
    orm.subscriptionTier = entity.subscriptionTier;
    orm.subscriptionExpiresAt = entity.subscriptionExpiresAt;
    orm.trialUsedAt = entity.trialUsedAt;
    orm.isEmailVerified = entity.isEmailVerified;
    orm.isPhoneVerified = entity.isPhoneVerified;
    orm.isActive = entity.isActive;
    orm.isBlocked = entity.isBlocked;
    orm.role = entity.role;
    orm.lastLoginAt = entity.lastLoginAt;
    orm.loginCount = entity.loginCount;
    orm.xpTotal = entity.xpTotal;
    orm.level = entity.level;
    orm.providersLinked = entity.providersLinked;
    return orm;
  }
}
