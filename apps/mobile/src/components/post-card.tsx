import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS } from "../constants";
import { UserAvatar } from "./user-avatar";
import type { Post } from "../hooks/use-feed";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, isLiked: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  function handleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike?.(post.id, newLiked);
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress?.(post.user.id)}
          activeOpacity={0.8}
        >
          <UserAvatar
            uri={post.user.avatar}
            name={post.user.name}
            size={40}
            level={post.user.level}
            isOnline={post.user.isOnline}
            showLevel
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <Text style={styles.userMeta}>
              @{post.user.username} · {timeAgo}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Location / Fish tag */}
        {(post.fishType || post.spotName) && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {post.fishType ? `🐟 ${post.fishType}` : `📍 ${post.spotName}`}
            </Text>
          </View>
        )}
      </View>

      {/* Image */}
      {post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Caption */}
      {post.caption ? (
        <View style={styles.captionRow}>
          <Text style={styles.userName}>{post.user.name} </Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
            {liked ? "❤️" : "🤍"}
          </Text>
          <Text
            style={[
              styles.actionCount,
              { color: liked ? "#EF4444" : COLORS.textMuted },
            ]}
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment?.(post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare?.(post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  userText: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
  },
  userMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  tag: {
    backgroundColor: "rgba(27,67,50,0.6)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  tagText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "600",
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    backgroundColor: COLORS.border,
  },
  captionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  caption: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionIcon: {
    fontSize: 20,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  actionCount: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
