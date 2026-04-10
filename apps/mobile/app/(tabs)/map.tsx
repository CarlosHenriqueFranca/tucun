// Map screen — UI layout with placeholder map view
// Real Mapbox integration requires expo prebuild / native build (expo run:ios or expo run:android)
// The rnmapbox/maps package is installed and ready; import MapView from '@rnmapbox/maps' in native builds.

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPOT_TYPES } from "../../src/constants";
import { useLocation } from "../../src/hooks/use-location";

const { width: W, height: H } = Dimensions.get("window");

const MOCK_SPOTS = [
  { id: "1", name: "Rio Madeira — Porto Velho", type: "river", fish: "Tucunaré", distance: "2.4km" },
  { id: "2", name: "Lago do Cuniã", type: "lake", fish: "Tambaqui", distance: "12km" },
  { id: "3", name: "Represa Samuel", type: "reservoir", fish: "Pirarucu", distance: "28km" },
  { id: "4", name: "Igarapé do Inferno", type: "stream", fish: "Traíra", distance: "5km" },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<typeof MOCK_SPOTS[number] | null>(null);
  const { getCurrentLocation, loading: locationLoading } = useLocation();

  const filteredSpots = MOCK_SPOTS.filter((s) => {
    const matchesType = activeFilter ? s.type === activeFilter : true;
    const matchesSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.fish.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  async function handleNearMe() {
    await getCurrentLocation();
    // In native build: fly MapView camera to user coordinates
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* MAP PLACEHOLDER — replace with <MapboxGL.MapView> in native build */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapBg}>
          {/* Grid lines suggesting map tiles */}
          {[...Array(8)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${i * 14.3}%` }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${i * 20}%` }]} />
          ))}
          {/* Mock pins */}
          {MOCK_SPOTS.map((spot, i) => (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.mapPin,
                {
                  top: `${20 + i * 18}%`,
                  left: `${15 + i * 20}%`,
                },
              ]}
              onPress={() => setSelectedSpot(spot)}
            >
              <Text style={styles.pinEmoji}>📍</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.mapLabel}>🗺️ Mapa Interativo</Text>
          <Text style={styles.mapSub}>
            Requer build nativo (expo run:ios / expo run:android)
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar pontos, peixes..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !activeFilter && styles.filterActive]}
          onPress={() => setActiveFilter(null)}
        >
          <Text style={[styles.filterText, !activeFilter && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {SPOT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.filterChip, activeFilter === t.id && styles.filterActive]}
            onPress={() => setActiveFilter(activeFilter === t.id ? null : t.id)}
          >
            <Text style={styles.filterEmoji}>{t.emoji}</Text>
            <Text
              style={[
                styles.filterText,
                activeFilter === t.id && styles.filterTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Near Me Button */}
      <TouchableOpacity
        style={styles.nearMeBtn}
        onPress={handleNearMe}
        disabled={locationLoading}
        activeOpacity={0.85}
      >
        <Text style={styles.nearMeText}>
          {locationLoading ? "Localizando..." : "📍 Perto de mim"}
        </Text>
      </TouchableOpacity>

      {/* FAB — Add spot */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Bottom Sheet — selected spot */}
      {selectedSpot && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{selectedSpot.name}</Text>
              <Text style={styles.sheetMeta}>
                🐟 {selectedSpot.fish} · 📏 {selectedSpot.distance}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedSpot(null)}>
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.sheetBtn}>
              <Text style={styles.sheetBtnText}>🧭 Navegar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, styles.sheetBtnSecondary]}>
              <Text style={[styles.sheetBtnText, { color: COLORS.secondary }]}>
                📸 Ver Posts
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nearby spots list */}
      {!selectedSpot && (
        <View style={styles.spotsList}>
          <Text style={styles.spotsListTitle}>Pontos próximos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredSpots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={styles.spotCard}
                onPress={() => setSelectedSpot(spot)}
                activeOpacity={0.85}
              >
                <Text style={styles.spotEmoji}>
                  {SPOT_TYPES.find((t) => t.id === spot.type)?.emoji ?? "📍"}
                </Text>
                <Text style={styles.spotName} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={styles.spotMeta}>🐟 {spot.fish}</Text>
                <Text style={styles.spotDist}>{spot.distance}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  mapPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapBg: {
    flex: 1,
    backgroundColor: "#0D1E35",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(64,145,108,0.06)",
  },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
  mapPin: {
    position: "absolute",
    zIndex: 2,
  },
  pinEmoji: { fontSize: 28 },
  mapLabel: {
    position: "absolute",
    bottom: 220,
    alignSelf: "center",
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
  mapSub: {
    position: "absolute",
    bottom: 200,
    alignSelf: "center",
    color: COLORS.textMuted,
    fontSize: 11,
    opacity: 0.6,
  },
  searchContainer: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  searchIcon: { fontSize: 18 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  filters: {
    position: "absolute",
    top: 165,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  filterEmoji: { fontSize: 14 },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.secondary,
  },
  nearMeBtn: {
    position: "absolute",
    top: 220,
    right: 16,
    zIndex: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nearMeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 180,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "700", lineHeight: 32 },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    zIndex: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sheetMeta: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sheetClose: {
    color: COLORS.textMuted,
    fontSize: 20,
    padding: 4,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  sheetBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetBtnSecondary: {
    backgroundColor: "rgba(64,145,108,0.15)",
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  sheetBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  spotsList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  spotsListTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  spotCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginLeft: 16,
    width: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  spotEmoji: { fontSize: 24, marginBottom: 6 },
  spotName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  spotMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  spotDist: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
