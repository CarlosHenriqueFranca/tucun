import { useState, useCallback, useEffect } from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { MAP_STYLE_URL } from "../constants";

export interface OfflinePack {
  name: string;
  bounds: [[number, number], [number, number]];
  minZoom: number;
  maxZoom: number;
  progress: number; // 0–100
  status: "inactive" | "active" | "complete" | "error";
  bytesCompleted: number;
}

export function useOfflineRegions() {
  const [packs, setPacks] = useState<OfflinePack[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPacks = useCallback(async () => {
    try {
      const offlinePacks = await MapLibreGL.offlineManager.getPacks();
      setPacks(
        offlinePacks.map((p: any) => ({
          name: p.name,
          bounds: p.bounds ?? [[0, 0], [0, 0]],
          minZoom: p.minZoom ?? 8,
          maxZoom: p.maxZoom ?? 15,
          progress: p.percentage ?? 0,
          status: p.state ?? "inactive",
          bytesCompleted: p.completedResourceSize ?? 0,
        }))
      );
    } catch {
      // ignore — offlineManager may not be ready yet
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const downloadRegion = useCallback(
    async (
      name: string,
      bounds: [[number, number], [number, number]],
      zoomLevel: "low" | "medium" | "high",
      onProgress: (pct: number) => void
    ) => {
      setLoading(true);
      const maxZoom = zoomLevel === "low" ? 12 : zoomLevel === "medium" ? 15 : 17;

      try {
        await MapLibreGL.offlineManager.createPack(
          {
            name,
            styleURL: MAP_STYLE_URL,
            minZoom: 8,
            maxZoom,
            bounds,
          },
          (_region: any, status: any) => {
            const pct = status?.percentage ?? 0;
            onProgress(pct);
            if (pct >= 100) {
              setLoading(false);
              loadPacks();
            }
          },
          (_region: any, err: any) => {
            console.warn("[Offline] download error:", err);
            setLoading(false);
          }
        );
      } catch (e) {
        console.warn("[Offline] createPack failed:", e);
        setLoading(false);
      }
    },
    [loadPacks]
  );

  const deleteRegion = useCallback(
    async (name: string) => {
      try {
        const pack = await MapLibreGL.offlineManager.getPack(name);
        if (pack) await MapLibreGL.offlineManager.deletePack(name);
        await loadPacks();
      } catch (e) {
        console.warn("[Offline] delete failed:", e);
      }
    },
    [loadPacks]
  );

  /** Rough MB estimate based on bounding box area × zoom multiplier */
  const estimateSize = (
    bounds: [[number, number], [number, number]],
    zoomLevel: "low" | "medium" | "high"
  ): string => {
    const latDiff = Math.abs(bounds[1][1] - bounds[0][1]);
    const lngDiff = Math.abs(bounds[1][0] - bounds[0][0]);
    const area = latDiff * lngDiff;
    const multiplier = zoomLevel === "low" ? 15 : zoomLevel === "medium" ? 80 : 350;
    const mb = Math.round(area * multiplier);
    return mb < 1000 ? `~${mb} MB` : `~${(mb / 1000).toFixed(1)} GB`;
  };

  return { packs, loading, downloadRegion, deleteRegion, estimateSize, loadPacks };
}
