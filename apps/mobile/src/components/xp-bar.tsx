import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, XP_LEVELS } from "../constants";

interface XPBarProps {
  xp: number;
  level: number;
  style?: ViewStyle;
  showLabel?: boolean;
}

export function XPBar({ xp, level, style, showLabel = true }: XPBarProps) {
  const currentLevelData = XP_LEVELS.find((l) => l.level === level);
  const nextLevelData = XP_LEVELS.find((l) => l.level === level + 1);

  const currentLevelXP = currentLevelData?.xpRequired ?? 0;
  const nextLevelXP = nextLevelData?.xpRequired ?? xp;

  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = xpNeeded > 0 ? Math.min(xpInCurrentLevel / xpNeeded, 1) : 1;

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labels}>
          <Text style={styles.xpText}>
            {xpInCurrentLevel.toLocaleString()} /{" "}
            {xpNeeded.toLocaleString()} XP
          </Text>
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>
      )}

      {/* Track */}
      <View style={styles.track}>
        {/* Fill */}
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` },
          ]}
        />
      </View>

      {showLabel && nextLevelData && (
        <Text style={styles.nextLevel}>
          Próximo nível: {nextLevelData.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  percentText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  track: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  nextLevel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
