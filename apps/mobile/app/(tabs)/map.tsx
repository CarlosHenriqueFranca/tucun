import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapLibreGL from "@maplibre/maplibre-react-native";
// @ts-expect-error turf types need bundler resolution
import { featureCollection, point } from "@turf/helpers";
import {
  MAP_STYLE_URL,
  COLORS,
  SPOT_TYPES,
  SPOT_TYPE_MAP,
  SpotTypeId,
} from "../../src/constants";
import { useLocation } from "../../src/hooks/use-location";
import { useNearbySpots, NearbySpot } from "../../src/hooks/use-nearby-spots";
import { CreateSpotSheet } from "../../src/components/create-spot-sheet";
import { OfflineRegionSheet } from "../../src/components/offline-region-sheet";

// MapLibre + OpenFreeMap: sem token, sem custo
MapLibreGL.setAccessToken(null);

const DEFAULT_CENTER: [number, number] = [-63.9004, -8.7612]; // Porto Velho
const DEFAULT_ZOOM = 12;

export default function MapScreen() {
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const [activeFilter, setActiveFilter] = useState<SpotTypeId | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<NearbySpot | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const [tapCoords, setTapCoords] = useState<[number, number]>(DEFAULT_CENTER);
  const [showHint, setShowHint] = useState(false);

  const { location, getCurrentLocation, loading: locLoading } = useLocation();
  const { spots, loading: spotsLoading, fetch: fetchSpots } = useNearbySpots({
    type: activeFilter ?? undefined,
    radius: 100_000,
  });

  useEffect(() => {
    const lat = location?.latitude ?? DEFAULT_CENTER[1];
    const lng = location?.longitude ?? DEFAULT_CENTER[0];
    fetchSpots(lat, lng);
  }, [location, activeFilter]);

  const handleNearMe = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      cameraRef.current?.flyTo([coords.longitude, coords.latitude], 800);
      fetchSpots(coords.latitude, coords.longitude);
    }
  }, [getCurrentLocation, fetchSpots]);

  const visibleSpots = spots.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.city ?? "").toLowerCase().includes(q)
    );
  });

  const geojson = featureCollection(
    visibleSpots.map((s) =>
      point([s.longitude, s.latitude], {
        id: s.id,
        name: s.name,
        type: s.type,
        emoji: SPOT_TYPE_MAP[s.type]?.emoji ?? "📍",
        color: SPOT_TYPE_MAP[s.type]?.color ?? COLORS.secondary,
        rating: s.averageRating,
        distance: formatDist(s.distanceMeters),
        verified: s.isVerified,
      })
    )
  );

  function openNav(spot: NearbySpot) {
    const label = encodeURIComponent(spot.name);
    const url =
      Platform.OS === "ios"
        ? `maps://?q=${label}&ll=${spot.latitude},${spot.longitude}`
        : `geo:${spot.latitude},${spot.longitude}?q=${label}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
      )
    );
  }

  function handleLongPress(e: { geometry: { coordinates: number[] } }) {
    const [lng, lat] = e.geometry.coordinates;
    setTapCoords([lng, lat]);
    setShowCreate(true);
    setShowHint(false);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* MAP */}
      <MapLibreGL.MapView
        style={s.map}
        styleURL={MAP_STYLE_URL}
        compassEnabled
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        onLongPress={handleLongPress}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={
            location
              ? [location.longitude, location.latitude]
              : DEFAULT_CENTER
          }
          zoomLevel={DEFAULT_ZOOM}
          animationDuration={800}
        />

        <MapLibreGL.UserLocation visible animated />

        {visibleSpots.length > 0 && (
          <MapLibreGL.ShapeSource
            id="spots"
            shape={geojson}
            cluster
            clusterRadius={50}
            clusterMaxZoomLevel={14}
            onPress={(e) => {
              const f = e.features[0];
              if (!f?.properties?.cluster) {
                const spot = visibleSpots.find(
                  (sp) => sp.id === f?.properties?.id
                );
                if (spot) {
                  setSelectedSpot(spot);
                  cameraRef.current?.flyTo(
                    [spot.longitude, spot.latitude],
                    400
                  );
                }
              }
            }}
          >
            {/* Cluster circle */}
            <MapLibreGL.CircleLayer
              id="clusters"
              filter={["has", "point_count"]}
              style={{
                circleRadius: ["step", ["get", "point_count"], 20, 5, 28, 20, 36],
                circleColor: COLORS.primary,
                circleStrokeWidth: 2,
                circleStrokeColor: COLORS.secondary,
                circleOpacity: 0.92,
              }}
            />
            <MapLibreGL.SymbolLayer
              id="cluster-count"
              filter={["has", "point_count"]}
              style={{
                textField: ["get", "point_count_abbreviated"],
                textSize: 14,
                textColor: "#fff",
              }}
            />

            {/* Individual spot */}
            <MapLibreGL.CircleLayer
              id="spots-dot"
              filter={["!", ["has", "point_count"]]}
              style={{
                circleRadius: 11,
                circleColor: ["get", "color"],
                circleStrokeWidth: 2,
                circleStrokeColor: "#fff",
              }}
            />
            <MapLibreGL.SymbolLayer
              id="spots-icon"
              filter={["!", ["has", "point_count"]]}
              style={{
                textField: ["get", "emoji"],
                textSize: 13,
                textAllowOverlap: true,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* SEARCH */}
      <View style={s.searchBox}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar pontos, cidades..."
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
        />
        {spotsLoading && (
          <ActivityIndicator size="small" color={COLORS.secondary} />
        )}
      </View>

      {/* FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtersRow}
        contentContainerStyle={s.filtersInner}
      >
        <TouchableOpacity
          style={[s.chip, !activeFilter && s.chipActive]}
          onPress={() => setActiveFilter(null)}
        >
          <Text style={[s.chipText, !activeFilter && s.chipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {SPOT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              s.chip,
              activeFilter === t.id && {
                backgroundColor: t.color,
                borderColor: t.color,
              },
            ]}
            onPress={() =>
              setActiveFilter(activeFilter === t.id ? null : t.id)
            }
          >
            <Text style={s.chipEmoji}>{t.emoji}</Text>
            <Text
              style={[
                s.chipText,
                activeFilter === t.id && s.chipTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SIDE BUTTONS */}
      <View style={s.side}>
        <TouchableOpacity
          style={s.sideBtn}
          onPress={handleNearMe}
          disabled={locLoading}
        >
          <Text style={s.sideBtnTxt}>{locLoading ? "⏳" : "📍"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.sideBtn}
          onPress={() => setShowOffline(true)}
        >
          <Text style={s.sideBtnTxt}>⬇️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.sideBtn}
          onPress={() => setShowHint((v) => !v)}
        >
          <Text style={s.sideBtnTxt}>➕</Text>
        </TouchableOpacity>
      </View>

      {showHint && (
        <View style={s.hint}>
          <Text style={s.hintTxt}>
            Pressione e segure no mapa para adicionar um ponto
          </Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => {
          setTapCoords(
            location
              ? [location.longitude, location.latitude]
              : DEFAULT_CENTER
          );
          setShowCreate(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={s.fabTxt}>+</Text>
      </TouchableOpacity>

      {/* SELECTED SPOT SHEET */}
      {selectedSpot && (
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.sheetRow}>
            <View style={s.typeTag}>
              <Text style={s.typeEmoji}>
                {SPOT_TYPE_MAP[selectedSpot.type]?.emoji ?? "📍"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.sheetTitle} numberOfLines={1}>
                  {selectedSpot.name}
                </Text>
                {selectedSpot.isVerified && (
                  <Text style={{ color: COLORS.success, fontWeight: "700" }}>✓</Text>
                )}
              </View>
              <Text style={s.sheetMeta}>
                {SPOT_TYPE_MAP[selectedSpot.type]?.label}
                {selectedSpot.city ? ` · ${selectedSpot.city}` : ""}
                {" · "}
                {formatDist(selectedSpot.distanceMeters)}
              </Text>
              {selectedSpot.averageRating > 0 && (
                <Text style={{ color: COLORS.accent, fontSize: 13, marginTop: 3 }}>
                  ⭐ {selectedSpot.averageRating.toFixed(1)} (
                  {selectedSpot.totalRatings} avaliações)
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setSelectedSpot(null)}>
              <Text style={s.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => openNav(selectedSpot)}
            >
              <Text style={s.actionBtnTxt}>🧭 Navegar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.actionBtnGhost]}>
              <Text style={[s.actionBtnTxt, { color: COLORS.secondary }]}>
                📸 Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.actionBtnGhost]}>
              <Text style={[s.actionBtnTxt, { color: COLORS.accent }]}>
                ⭐ Avaliar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* NEARBY LIST */}
      {!selectedSpot && visibleSpots.length > 0 && (
        <View style={s.nearbyPanel}>
          <Text style={s.nearbyTitle}>{visibleSpots.length} pontos próximos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {visibleSpots.slice(0, 10).map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={s.nearbyCard}
                onPress={() => {
                  setSelectedSpot(spot);
                  cameraRef.current?.flyTo(
                    [spot.longitude, spot.latitude],
                    600
                  );
                }}
              >
                <Text style={s.nearbyEmoji}>
                  {SPOT_TYPE_MAP[spot.type]?.emoji ?? "📍"}
                </Text>
                <Text style={s.nearbyName} numberOfLines={2}>
                  {spot.name}
                </Text>
                {spot.averageRating > 0 && (
                  <Text style={s.nearbyRating}>
                    ⭐ {spot.averageRating.toFixed(1)}
                  </Text>
                )}
                <Text style={s.nearbyDist}>
                  {formatDist(spot.distanceMeters)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* CREATE SPOT */}
      <CreateSpotSheet
        visible={showCreate}
        latitude={tapCoords[1]}
        longitude={tapCoords[0]}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          fetchSpots(
            location?.latitude ?? DEFAULT_CENTER[1],
            location?.longitude ?? DEFAULT_CENTER[0]
          );
        }}
      />

      {/* OFFLINE MAPS */}
      <OfflineRegionSheet
        visible={showOffline}
        onClose={() => setShowOffline(false)}
      />
    </SafeAreaView>
  );
}

function formatDist(m: number): string {
  if (!m) return "";
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },

  searchBox: {
    position: "absolute", top: 56, left: 16, right: 16, zIndex: 10,
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },

  filtersRow: { position: "absolute", top: 115, left: 0, right: 0, zIndex: 10 },
  filtersInner: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.secondary },
  chipEmoji: { fontSize: 13 },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: COLORS.text },

  side: { position: "absolute", right: 16, top: 175, zIndex: 10, gap: 10 },
  sideBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  sideBtnTxt: { fontSize: 20 },

  hint: {
    position: "absolute", right: 68, top: 265, zIndex: 10,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.border, maxWidth: 200,
  },
  hintTxt: { color: COLORS.text, fontSize: 12 },

  fab: {
    position: "absolute", bottom: 190, right: 20, zIndex: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 12,
  },
  fabTxt: { color: "#fff", fontSize: 28, fontWeight: "700", lineHeight: 32 },

  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16,
  },
  sheetRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  typeTag: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },
  typeEmoji: { fontSize: 20 },
  sheetTitle: { color: COLORS.text, fontSize: 17, fontWeight: "700", flex: 1 },
  sheetMeta: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
  closeBtn: { color: COLORS.textMuted, fontSize: 20, padding: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  actionBtnGhost: {
    backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },

  nearbyPanel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingTop: 14, paddingBottom: 6,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  nearbyTitle: {
    color: COLORS.text, fontSize: 14, fontWeight: "700",
    paddingHorizontal: 16, marginBottom: 10,
  },
  nearbyCard: {
    backgroundColor: COLORS.background, borderRadius: 14,
    padding: 13, marginLeft: 16, width: 130,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  nearbyEmoji: { fontSize: 22, marginBottom: 6 },
  nearbyName: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  nearbyRating: { color: COLORS.accent, fontSize: 11, marginTop: 4 },
  nearbyDist: { color: COLORS.secondary, fontSize: 11, fontWeight: "600", marginTop: 3 },
});
