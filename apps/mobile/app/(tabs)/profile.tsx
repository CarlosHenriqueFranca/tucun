import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, WEB_URL, XP_LEVELS } from "../../src/constants";
import { useAuthStore } from "../../src/store/auth.store";
import { UserAvatar } from "../../src/components/user-avatar";
import { BadgeChip } from "../../src/components/badge-chip";
import { XPBar } from "../../src/components/xp-bar";
import type { Badge } from "../../src/store/auth.store";

const { width: W } = Dimensions.get("window");
const GRID_CELL = (W - 32 - 8) / 3;

// Mock post thumbnails for grid
const MOCK_POSTS = Array.from({ length: 9 }, (_, i) => ({
  id: String(i),
  color: i % 3 === 0 ? "#1B4332" : i % 3 === 1 ? "#0D1E35" : "#1A2744",
}));

const MOCK_BADGES: Badge[] = [
  { id: "1", name: "Primeiro Peixe", emoji: "🐟", rarity: "common", description: "", earnedAt: "" },
  { id: "2", name: "Mestre do Rio", emoji: "🏆", rarity: "epic", description: "", earnedAt: "" },
  { id: "3", name: "Explorador", emoji: "🗺️", rarity: "rare", description: "", earnedAt: "" },
  { id: "4", name: "Lendário", emoji: "⭐", rarity: "legendary", description: "", earnedAt: "" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const displayUser = user ?? {
    name: "Pescador",
    username: "pescador",
    avatar: null,
    level: 3,
    xp: 450,
    xpToNextLevel: 600,
    bio: "Apaixonado por pesca em Rondônia 🎣",
    city: "Porto Velho",
    state: "RO",
    followersCount: 128,
    followingCount: 64,
    postsCount: 23,
    badges: MOCK_BADGES,
    isSubscribed: false,
    subscriptionExpiresAt: null,
  };

  const levelData = XP_LEVELS.find((l) => l.level === displayUser.level);

  function handleSubscribe() {
    Linking.openURL(`${WEB_URL}/assinar`);
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / settings */}
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.settingsBtn}>
            <Text style={styles.settingsEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Cover + Avatar */}
        <View style={styles.coverArea}>
          <View style={styles.cover} />
          <View style={styles.avatarWrapper}>
            <UserAvatar
              uri={displayUser.avatar}
              name={displayUser.name}
              size={88}
              level={displayUser.level}
              showLevel
            />
          </View>
        </View>

        {/* Level badge */}
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Nível {displayUser.level} · {levelData?.label ?? ""}
            </Text>
          </View>
        </View>

        {/* User info */}
        <View style={styles.userInfoBlock}>
          <Text style={styles.userName}>{displayUser.name}</Text>
          <Text style={styles.userHandle}>@{displayUser.username}</Text>
          {displayUser.bio && (
            <Text style={styles.bio}>{displayUser.bio}</Text>
          )}
          {(displayUser.city || displayUser.state) && (
            <Text style={styles.location}>
              📍 {[displayUser.city, displayUser.state].filter(Boolean).join(", ")}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Posts", value: displayUser.postsCount },
            { label: "Seguidores", value: displayUser.followersCount },
            { label: "Seguindo", value: displayUser.followingCount },
          ].map((s) => (
            <TouchableOpacity key={s.label} style={styles.stat} activeOpacity={0.7}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* XP Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiência (XP)</Text>
          <XPBar xp={displayUser.xp} level={displayUser.level} />
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgesRow}>
              {(displayUser.badges?.length ? displayUser.badges : MOCK_BADGES).map(
                (badge) => (
                  <BadgeChip key={badge.id} badge={badge} size="md" />
                )
              )}
            </View>
          </ScrollView>
        </View>

        {/* Subscription CTA */}
        {!displayUser.isSubscribed && (
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            activeOpacity={0.85}
          >
            <Text style={styles.subscribeEmoji}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.subscribeBtnTitle}>Ativar Premium</Text>
              <Text style={styles.subscribeBtnSub}>
                7 dias grátis · Todos os recursos
              </Text>
            </View>
            <Text style={styles.subscribeArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Posts Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Fotos</Text>
          <View style={styles.grid}>
            {MOCK_POSTS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.gridCell, { backgroundColor: p.color }]}
                activeOpacity={0.85}
              >
                <Text style={styles.gridEmoji}>🎣</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  settingsBtn: { padding: 6 },
  settingsEmoji: { fontSize: 24 },
  coverArea: {
    position: "relative",
    marginBottom: 50,
  },
  cover: {
    height: 120,
    backgroundColor: COLORS.primary,
    // Could be an Image component in production
    backgroundImage: undefined,
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -44,
    left: 16,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  levelRow: {
    paddingHorizontal: 16,
    alignItems: "flex-end",
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "rgba(27,67,50,0.6)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  levelBadgeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "700",
  },
  userInfoBlock: {
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 16,
  },
  userName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  userHandle: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  bio: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  location: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 10,
  },
  subscribeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(247,127,0,0.15)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  subscribeEmoji: { fontSize: 28 },
  subscribeBtnTitle: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  subscribeBtnSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  subscribeArrow: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  gridCell: {
    width: GRID_CELL,
    height: GRID_CELL,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  gridEmoji: { fontSize: 32 },
});
