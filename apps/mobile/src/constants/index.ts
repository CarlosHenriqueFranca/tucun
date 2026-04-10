export const API_URL = __DEV__
  ? "http://localhost:3333/api"
  : "https://api.tucun.app/api";

export const WEB_URL = __DEV__ ? "http://localhost:3000" : "https://tucun.app";

export const XP_LEVELS = [
  { level: 1, label: "Iniciante", xpRequired: 0 },
  { level: 2, label: "Aprendiz", xpRequired: 100 },
  { level: 3, label: "Pescador", xpRequired: 300 },
  { level: 4, label: "Experiente", xpRequired: 600 },
  { level: 5, label: "Veterano", xpRequired: 1000 },
  { level: 6, label: "Especialista", xpRequired: 1500 },
  { level: 7, label: "Mestre", xpRequired: 2200 },
  { level: 8, label: "Lendário", xpRequired: 3000 },
  { level: 9, label: "Campeão", xpRequired: 4000 },
  { level: 10, label: "Pescador Supremo", xpRequired: 5500 },
];

export const COLORS = {
  primary: "#1B4332",
  secondary: "#40916C",
  accent: "#F77F00",
  background: "#0A1628",
  surface: "#1A2744",
  text: "#E8F5E9",
  textMuted: "#9CA3AF",
  border: "#2D3748",
  danger: "#EF4444",
  success: "#10B981",
} as const;

export const BADGE_RARITY_COLORS = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F77F00",
} as const;

export const FISH_TYPES = [
  "Tucunaré",
  "Tambaqui",
  "Pirarucu",
  "Surubim",
  "Piranha",
  "Traíra",
  "Pacu",
  "Jaraqui",
  "Matrinchã",
  "Curimatã",
] as const;

export const SPOT_TYPES = [
  { id: "river", label: "Rio", emoji: "🏞️" },
  { id: "lake", label: "Lago", emoji: "🌊" },
  { id: "reservoir", label: "Represa", emoji: "💧" },
  { id: "stream", label: "Igarapé", emoji: "🌿" },
] as const;
