import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface UseLocationReturn {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Coordinates | null>;
  watchLocation: () => () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);

  // Check permission on mount
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status === Location.PermissionStatus.GRANTED;
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);
    try {
      let status = permissionStatus;
      if (status !== Location.PermissionStatus.GRANTED) {
        const granted = await requestPermission();
        if (!granted) {
          setError(
            "Permissão de localização negada. Ative nas configurações do app."
          );
          return null;
        }
        status = Location.PermissionStatus.GRANTED;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: Coordinates = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy,
      };
      setLocation(coords);
      return coords;
    } catch {
      setError("Não foi possível obter sua localização.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [permissionStatus, requestPermission]);

  const watchLocation = useCallback((): (() => void) => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const status =
        permissionStatus ?? (await Location.getForegroundPermissionsAsync()).status;
      if (status !== Location.PermissionStatus.GRANTED) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, [permissionStatus]);

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
    watchLocation,
  };
}
