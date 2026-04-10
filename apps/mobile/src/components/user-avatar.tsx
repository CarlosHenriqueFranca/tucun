import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS } from "../constants";

interface UserAvatarProps {
  uri: string | null;
  name: string;
  size?: number;
  level?: number;
  isOnline?: boolean;
  showLevel?: boolean;
  style?: ViewStyle;
}

export function UserAvatar({
  uri,
  name,
  size = 48,
  level,
  isOnline = false,
  showLevel = false,
  style,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Avatar */}
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text
            style={[styles.initials, { fontSize: size * 0.35 }]}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* Online indicator */}
      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}

      {/* Level badge */}
      {showLevel && level !== undefined && (
        <View
          style={[
            styles.levelBadge,
            { bottom: -4, right: -4 },
          ]}
        >
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.surface,
  },
  placeholder: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: COLORS.text,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  levelBadge: {
    position: "absolute",
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
