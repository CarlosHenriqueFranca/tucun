import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  xpTotal: number;
  level: number;
  levelName: string;
  badges: {
    id: string;
    name: string;
    iconUrl: string | null;
    rarity: string;
  }[];
}

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<LeaderboardEntry[]> {
    const users = await this.dataSource.query<
      {
        id: string;
        name: string;
        username: string;
        avatar_url: string | null;
        xp_total: number;
      }[]
    >(
      `SELECT id, name, username, avatar_url, xp_total
       FROM users
       ORDER BY xp_total DESC
       LIMIT 100`,
    );

    const leaderboard: LeaderboardEntry[] = await Promise.all(
      users.map(async (user, index) => {
        const xp = Number(user.xp_total ?? 0);
        const levelInfo = this.getLevelForXp(xp);

        const badges = await this.dataSource.query<
          { id: string; name: string; icon_url: string | null; rarity: string }[]
        >(
          `SELECT b.id, b.name, b.icon_url, b.rarity
           FROM badges b
           INNER JOIN user_badges ub ON ub.badge_id = b.id
           WHERE ub.user_id = $1
           LIMIT 5`,
          [user.id],
        );

        return {
          rank: index + 1,
          userId: user.id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          xpTotal: xp,
          level: levelInfo.level,
          levelName: levelInfo.name,
          badges: badges.map((b) => ({
            id: b.id,
            name: b.name,
            iconUrl: b.icon_url,
            rarity: b.rarity,
          })),
        };
      }),
    );

    return leaderboard;
  }

  private getLevelForXp(xp: number): { level: number; name: string } {
    const thresholds = [
      { level: 1, name: 'Iniciante', xp: 0 },
      { level: 2, name: 'Aprendiz', xp: 500 },
      { level: 3, name: 'Pescador', xp: 1500 },
      { level: 4, name: 'Explorador', xp: 3500 },
      { level: 5, name: 'Desbravador', xp: 7500 },
      { level: 6, name: 'Veterano', xp: 15000 },
      { level: 7, name: 'Mestre', xp: 30000 },
      { level: 8, name: 'Lenda', xp: 55000 },
      { level: 9, name: 'Grande Mestre', xp: 90000 },
      { level: 10, name: 'Tucunaré Lenda', xp: 150000 },
    ];

    let current = thresholds[0];
    for (const t of thresholds) {
      if (xp >= t.xp) current = t;
      else break;
    }
    return { level: current.level, name: current.name };
  }
}
