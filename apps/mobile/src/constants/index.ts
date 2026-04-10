export const API_URL = __DEV__
  ? "http://localhost:3333/api"
  : "https://api.tucun.app/api";

export const WEB_URL = __DEV__ ? "http://localhost:3000" : "https://tucun.app";

// ─── Mapbox ───────────────────────────────────────────────────────────────────
// 1. Acesse https://account.mapbox.com/
// 2. Crie um token público (pk.ey...) e cole abaixo
// 3. Para o build nativo, adicione o token secreto (sk.ey...) no app.json
export const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "SEU_TOKEN_AQUI";

// ─── Levels ───────────────────────────────────────────────────────────────────
export const XP_LEVELS = [
  { level: 1, label: "Iniciante",        xpRequired: 0 },
  { level: 2, label: "Aprendiz",         xpRequired: 500 },
  { level: 3, label: "Pescador",         xpRequired: 1500 },
  { level: 4, label: "Explorador",       xpRequired: 3500 },
  { level: 5, label: "Desbravador",      xpRequired: 7500 },
  { level: 6, label: "Veterano",         xpRequired: 15000 },
  { level: 7, label: "Mestre",           xpRequired: 30000 },
  { level: 8, label: "Lenda",            xpRequired: 55000 },
  { level: 9, label: "Grande Mestre",    xpRequired: 90000 },
  { level: 10, label: "Tucunaré Lenda",  xpRequired: 150000 },
];

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  primary:    "#1B4332",
  secondary:  "#40916C",
  accent:     "#F77F00",
  background: "#0A1628",
  surface:    "#1A2744",
  text:       "#E8F5E9",
  textMuted:  "#9CA3AF",
  border:     "#2D3748",
  danger:     "#EF4444",
  success:    "#10B981",
} as const;

export const BADGE_RARITY_COLORS = {
  common:    "#9CA3AF",
  rare:      "#3B82F6",
  epic:      "#8B5CF6",
  legendary: "#F77F00",
} as const;

// ─── Spot types (must match API enum SpotType) ────────────────────────────────
export const SPOT_TYPES = [
  { id: "ponto_de_pesca",    label: "Pesca",      emoji: "🎣", color: "#40916C" },
  { id: "acampamento",       label: "Camping",    emoji: "⛺", color: "#F77F00" },
  { id: "marina",            label: "Marina",     emoji: "⚓", color: "#3B82F6" },
  { id: "posto_de_gasolina", label: "Combustível",emoji: "⛽", color: "#EF4444" },
  { id: "mercado",           label: "Mercado",    emoji: "🛒", color: "#8B5CF6" },
  { id: "hospital",          label: "Hospital",   emoji: "🏥", color: "#EC4899" },
  { id: "policia",           label: "Polícia",    emoji: "🚔", color: "#1D4ED8" },
  { id: "hotel",             label: "Hotel",      emoji: "🏨", color: "#D97706" },
] as const;

export type SpotTypeId = typeof SPOT_TYPES[number]["id"];

export const SPOT_TYPE_MAP = Object.fromEntries(
  SPOT_TYPES.map((t) => [t.id, t])
) as Record<SpotTypeId, typeof SPOT_TYPES[number]>;

// ─── Fish ─────────────────────────────────────────────────────────────────────
export const FISH_TYPES = [
  "Tucunaré", "Tambaqui", "Pirarucu", "Surubim", "Piranha",
  "Traíra", "Pacu", "Jaraqui", "Matrinchã", "Curimatã",
] as const;
