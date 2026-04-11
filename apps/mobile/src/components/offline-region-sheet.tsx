import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { COLORS, MAP_STYLE_URL } from "../constants";
import { useOfflineRegions } from "../hooks/use-offline-regions";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ZoomLevel = "low" | "medium" | "high";

const ZOOM_OPTIONS: { id: ZoomLevel; label: string; desc: string }[] = [
  { id: "low",    label: "Básico",     desc: "Estradas e cidades · até zoom 12" },
  { id: "medium", label: "Médio",      desc: "Rios e trilhas · até zoom 15" },
  { id: "high",   label: "Detalhado",  desc: "Máximo detalhe · até zoom 17" },
];

export function OfflineRegionSheet({ visible, onClose }: Props) {
  const [tab, setTab] = useState<"download" | "saved">("download");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("medium");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapBounds, setMapBounds] =
    useState<[[number, number], [number, number]] | null>(null);

  const { packs, downloadRegion, deleteRegion, estimateSize, loadPacks } =
    useOfflineRegions();

  async function handleDownload() {
    if (!mapBounds) {
      Alert.alert("Atenção", "Navegue no mapa abaixo para selecionar a área.");
      return;
    }
    const now = new Date();
    const name = `Área ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    setDownloading(true);
    setProgress(0);

    await downloadRegion(name, mapBounds, zoomLevel, (pct) => {
      setProgress(pct);
      if (pct >= 100) {
        setDownloading(false);
        setProgress(0);
        setTab("saved");
        loadPacks();
      }
    });
  }

  function formatBytes(bytes: number): string {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1000 ? `${mb.toFixed(0)} MB` : `${(mb / 1024).toFixed(1)} GB`;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>🗺️ Mapas Offline</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, tab === "download" && s.tabActive]}
              onPress={() => setTab("download")}
            >
              <Text style={[s.tabTxt, tab === "download" && s.tabTxtActive]}>
                ⬇ Baixar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, tab === "saved" && s.tabActive]}
              onPress={() => { setTab("saved"); loadPacks(); }}
            >
              <Text style={[s.tabTxt, tab === "saved" && s.tabTxtActive]}>
                📦 Salvos ({packs.length})
              </Text>
            </TouchableOpacity>
          </View>

          {tab === "download" ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Mini map to select region */}
              <Text style={s.label}>Selecione a área no mapa</Text>
              <Text style={s.sublabel}>
                Navegue e faça zoom — o retângulo central será baixado
              </Text>

              <View style={s.mapContainer}>
                <MapLibreGL.MapView
                  style={s.miniMap}
                  styleURL={MAP_STYLE_URL}
                  attributionEnabled={false}
                  logoEnabled={false}
                  onRegionDidChange={(feature: any) => {
                    // visibleBounds = [[maxLng, maxLat], [minLng, minLat]]
                    const vb = feature.properties?.visibleBounds;
                    if (vb && vb.length === 2) {
                      setMapBounds([
                        [vb[1][0], vb[1][1]], // SW [lng, lat]
                        [vb[0][0], vb[0][1]], // NE [lng, lat]
                      ]);
                    }
                  }}
                >
                  <MapLibreGL.Camera
                    zoomLevel={7}
                    centerCoordinate={[-63.9004, -8.7612]}
                  />
                </MapLibreGL.MapView>
                {/* Visual bounding box guide */}
                <View style={s.boundingBox} pointerEvents="none" />
              </View>

              {/* Zoom level selector */}
              <Text style={s.label}>Nível de detalhe</Text>
              {ZOOM_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    s.zoomOption,
                    zoomLevel === opt.id && s.zoomOptionActive,
                  ]}
                  onPress={() => setZoomLevel(opt.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.zoomLabel,
                        zoomLevel === opt.id && s.zoomLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={s.zoomDesc}>{opt.desc}</Text>
                  </View>
                  {mapBounds && (
                    <Text style={s.sizeEst}>
                      {estimateSize(mapBounds, opt.id)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* Progress bar */}
              {downloading && (
                <View style={s.progressBox}>
                  <Text style={s.progressTxt}>
                    Baixando... {Math.round(progress)}%
                  </Text>
                  <View style={s.progressBar}>
                    <View
                      style={[
                        s.progressFill,
                        { width: `${Math.min(progress, 100)}%` as any },
                      ]}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  s.downloadBtn,
                  (downloading || !mapBounds) && s.downloadBtnDisabled,
                ]}
                onPress={handleDownload}
                disabled={downloading || !mapBounds}
              >
                {downloading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.downloadBtnTxt}>⬇ Baixar esta área</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Saved regions list */
            <ScrollView showsVerticalScrollIndicator={false}>
              {packs.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyEmoji}>📦</Text>
                  <Text style={s.emptyTxt}>Nenhuma área baixada</Text>
                  <Text style={s.emptySubtxt}>
                    Baixe regiões para usar o mapa sem internet
                  </Text>
                  <TouchableOpacity
                    style={s.emptyBtn}
                    onPress={() => setTab("download")}
                  >
                    <Text style={s.emptyBtnTxt}>⬇ Baixar área</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                packs.map((pack) => (
                  <View key={pack.name} style={s.packCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.packName} numberOfLines={1}>
                        {pack.name}
                      </Text>
                      <Text style={s.packMeta}>
                        {pack.status === "complete"
                          ? "✅ Completo"
                          : `⏳ ${Math.round(pack.progress)}%`}
                        {pack.bytesCompleted > 0
                          ? ` · ${formatBytes(pack.bytesCompleted)}`
                          : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Excluir região",
                          `Excluir "${pack.name}" do dispositivo?`,
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Excluir",
                              style: "destructive",
                              onPress: () => deleteRegion(pack.name),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={s.deleteBtn}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "92%",
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  close: { color: COLORS.textMuted, fontSize: 20, padding: 4 },

  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.surface },
  tabTxt: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  tabTxtActive: { color: COLORS.text },

  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 14,
  },
  sublabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 10 },

  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  miniMap: { flex: 1 },
  boundingBox: {
    position: "absolute",
    top: "15%", left: "10%", right: "10%", bottom: "15%",
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 4,
    backgroundColor: "rgba(247,127,0,0.08)",
  },

  zoomOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  zoomOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(247,127,0,0.08)",
  },
  zoomLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "700" },
  zoomLabelActive: { color: COLORS.accent },
  zoomDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  sizeEst: { color: COLORS.secondary, fontSize: 12, fontWeight: "600" },

  progressBox: { marginTop: 12, marginBottom: 4 },
  progressTxt: { color: COLORS.text, fontSize: 13, marginBottom: 8 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },

  downloadBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  downloadBtnDisabled: { opacity: 0.45 },
  downloadBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },

  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTxt: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  emptySubtxt: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

  packCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  packName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  packMeta: { color: COLORS.textMuted, fontSize: 12, marginTop: 3 },
  deleteBtn: { fontSize: 20, padding: 4 },
});
