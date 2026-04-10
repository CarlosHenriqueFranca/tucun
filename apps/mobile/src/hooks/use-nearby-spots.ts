import { useState, useCallback } from "react";
import { api } from "../lib/api";
import { SpotTypeId } from "../constants";

export interface NearbySpot {
  id: string;
  name: string;
  description: string | null;
  type: SpotTypeId;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  averageRating: number;
  totalRatings: number;
  totalCheckins: number;
  distanceMeters: number;
}

interface UseNearbySpotsOptions {
  radius?: number; // metros, default 50km
  type?: SpotTypeId;
}

export function useNearbySpots(options: UseNearbySpotsOptions = {}) {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (latitude: number, longitude: number) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          latitude,
          longitude,
          radius: options.radius ?? 50000,
          limit: 50,
        };
        if (options.type) params.type = options.type;

        const res = await api.get<{ success: boolean; data: NearbySpot[] }>(
          "/spots/nearby",
          { params }
        );
        setSpots(res.data.data ?? []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao buscar pontos";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [options.radius, options.type]
  );

  return { spots, loading, error, fetch };
}
