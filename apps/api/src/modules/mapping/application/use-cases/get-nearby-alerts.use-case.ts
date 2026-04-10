import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RouteAlertOrmEntity } from '../../infrastructure/persistence/route-alert.orm-entity';

export interface GetNearbyAlertsInput {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface NearbyAlertResult extends RouteAlertOrmEntity {
  distanceMeters: number;
}

@Injectable()
export class GetNearbyAlertsUseCase {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: GetNearbyAlertsInput): Promise<NearbyAlertResult[]> {
    const { latitude, longitude, radius = 50000 } = input;

    const query = `
      SELECT
        a.*,
        ST_Distance(
          ST_MakePoint(a.longitude::float8, a.latitude::float8)::geography,
          ST_MakePoint($2::float8, $1::float8)::geography
        ) AS "distanceMeters"
      FROM route_alerts a
      WHERE
        a.is_active = true
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND ST_DWithin(
          ST_MakePoint(a.longitude::float8, a.latitude::float8)::geography,
          ST_MakePoint($2::float8, $1::float8)::geography,
          $3
        )
      ORDER BY "distanceMeters" ASC
    `;

    return this.dataSource.query<NearbyAlertResult[]>(query, [latitude, longitude, radius]);
  }
}
