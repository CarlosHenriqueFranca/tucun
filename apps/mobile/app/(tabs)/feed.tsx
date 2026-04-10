import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants";
import { useFeed, likePost, unlikePost } from "../../src/hooks/use-feed";
import { PostCard } from "../../src/components/post-card";
import type { Post } from "../../src/hooks/use-feed";

const MOCK_STORIES = [
  { id: "1", name: "Você", emoji: "➕", isOwn: true },
  { id: "2", name: "JoãoPesca", emoji: "🎣", isOwn: false },
  { id: "3", name: "MaríaRio", emoji: "🐟", isOwn: false },
  { id: "4", name: "TucuRJ", emoji: "🌊", isOwn: false },
  { id: "5", name: "PedroAm", emoji: "🏆", isOwn: false },
];

export default function FeedScreen() {
  const [tab, setTab] = useState<"discover" | "following">("discover");
  const [refreshing, setRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading } =
    useFeed(tab);

  const posts: Post[] = data?.pages.flatMap((p) => p.posts) ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function handleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      likePost(postId).catch(console.error);
    } else {
      unlikePost(postId).catch(console.error);
    }
  }

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  const renderHeader = () => (
    <View>
      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        {(["discover", "following"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "discover" ? "Descobrir" : "Seguindo"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stories Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesRow}
        contentContainerStyle={styles.storiesContent}
      >
        {MOCK_STORIES.map((story) => (
          <TouchableOpacity key={story.id} style={styles.story} activeOpacity={0.8}>
            <View
              style={[
                styles.storyRing,
                story.isOwn && styles.storyRingOwn,
              ]}
            >
              <View style={styles.storyAvatar}>
                <Text style={styles.storyEmoji}>{story.emoji}</Text>
              </View>
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {story.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.secondary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.skeleton}>
              <View style={styles.skeletonHeader}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonLines}>
                  <View style={[styles.skeletonLine, { width: "60%" }]} />
                  <View style={[styles.skeletonLine, { width: "40%" }]} />
                </View>
              </View>
              <View style={styles.skeletonImage} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎣</Text>
        <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
        <Text style={styles.emptySubtitle}>
          {tab === "following"
            ? "Siga outros pescadores para ver o feed deles aqui."
            : "Seja o primeiro a compartilhar sua pesca!"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingBottom: 20 },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.secondary,
  },
  storiesRow: { marginBottom: 12 },
  storiesContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  story: { alignItems: "center", width: 70 },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: 6,
  },
  storyRingOwn: {
    borderColor: COLORS.border,
  },
  storyAvatar: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  storyEmoji: { fontSize: 24 },
  storyName: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  skeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  skeletonLines: { flex: 1, gap: 8 },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  skeletonImage: {
    height: 200,
    backgroundColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 48, textAlign: "center", marginTop: 40 },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
