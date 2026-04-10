import { UserEntity } from '../entities/user.entity';

export interface FindManyOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByWhatsapp(whatsapp: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  existsByWhatsapp(whatsapp: string): Promise<boolean>;
  findFollowers(
    userId: string,
    options?: FindManyOptions,
  ): Promise<PaginatedResult<UserEntity>>;
  findFollowing(
    userId: string,
    options?: FindManyOptions,
  ): Promise<PaginatedResult<UserEntity>>;
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}
