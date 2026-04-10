import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FishingSpotOrmEntity, SpotType } from '../../infrastructure/persistence/fishing-spot.orm-entity';

export interface GetNearbySpotsInput {
  latitude: number;
  longitude: number;
  radius?: number;
  type?: SpotType;
  page?: number;
  limit?: number;
}

export interface NearbySpotResult extends FishingSpotOrmEntity {
  distanceMeters: number;
}

@Injectable()
export class GetNearbySpotsUseCase {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: GetNearbySpotsInput): Promise<{ data: NearbySpotResult[]; total: number }> {
    const {
      latitude,
      longitude,
      radius = 50000,
      type,
      page = 1,
      limit = 20,
    } = input;

    const offset = (page - 1) * limit;

    const typeCondition = type ? `AND s.type = '${type}'` : '';

    const query = `
      SELECT
        s.*,
        ST_Distance(
          ST_MakePoint(s.longitude::float8, s.latitude::float8)::geography,
          ST_MakePoint($2::float8, $1::float8)::geography
        ) AS "distanceMeters"
      FROM fishing_spots s
      WHERE
        s.is_active = true
        AND ST_DWithin(
          ST_MakePoint(s.longitude::float8, s.latitude::float8)::geography,
          ST_MakePoint($2::float8, $1::float8)::geography,
          $3
        )
        ${typeCondition}
      ORDER BY "distanceMeters" ASC
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM fishing_spots s
      WHERE
        s.is_active = true
        AND ST_DWithin(
          ST_MakePoint(s.longitude::float8, s.latitude::float8)::geography,
          ST_MakePoint($2::float8, $1::float8)::geography,
          $3
        )
        ${typeCondition}
    `;

    const [data, countResult] = await Promise.all([
      this.dataSource.query<NearbySpotResult[]>(query, [latitude, longitude, radius, limit, offset]),
      this.dataSource.query<{ total: string }[]>(countQuery, [latitude, longitude, radius]),
    ]);

    return {
      data,
      total: parseInt(countResult[0]?.total ?? '0', 10),
    };
  }
}
