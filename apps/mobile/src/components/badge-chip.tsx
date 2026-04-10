import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { BADGE_RARITY_COLORS, COLORS } from "../constants";
import type { Badge } from "../store/auth.store";

interface BadgeChipProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function BadgeChip({ badge, size = "md", style }: BadgeChipProps) {
  const rarityColor = BADGE_RARITY_COLORS[badge.rarity];

  const sizeStyles = {
    sm: { padding: 6, emojiSize: 16, fontSize: 10, borderRadius: 8 },
    md: { padding: 10, emojiSize: 22, fontSize: 11, borderRadius: 12 },
    lg: { padding: 14, emojiSize: 30, fontSize: 13, borderRadius: 16 },
  }[size];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: rarityColor,
          borderRadius: sizeStyles.borderRadius,
          padding: sizeStyles.padding,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: sizeStyles.emojiSize }}>{badge.emoji}</Text>
      <Text
        style={[
          styles.name,
          { color: rarityColor, fontSize: sizeStyles.fontSize },
        ]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
      {size !== "sm" && (
        <Text
          style={[
            styles.rarity,
            { color: rarityColor, fontSize: sizeStyles.fontSize - 1 },
          ]}
        >
          {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    gap: 4,
    minWidth: 70,
  },
  name: {
    fontWeight: "700",
    textAlign: "center",
  },
  rarity: {
    fontWeight: "500",
    opacity: 0.8,
  },
});
