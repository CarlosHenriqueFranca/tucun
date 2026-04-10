import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS } from "../../src/constants";
import { UserAvatar } from "../../src/components/user-avatar";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isGroup: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    user: { id: "u1", name: "João Pescador", username: "joaopesca", avatar: null, isOnline: true },
    lastMessage: "Cara, o tucunaré tá na boca do rio agora! 🎣",
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 3,
    isGroup: false,
  },
  {
    id: "2",
    user: { id: "u2", name: "Maria Amazônia", username: "mariaamazonia", avatar: null, isOnline: false },
    lastMessage: "Qual isca você usou?",
    lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: "3",
    user: { id: "g1", name: "Pescadores de RO 🎣", username: "grupo", avatar: null, isOnline: false },
    lastMessage: "Pedro: Pessoal, chuva forte no Madeira hoje!",
    lastMessageAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    unreadCount: 12,
    isGroup: true,
  },
  {
    id: "4",
    user: { id: "u3", name: "Carlos Tambaqui", username: "carlostambaqui", avatar: null, isOnline: true },
    lastMessage: "Vou amanhã cedo, topa ir junto?",
    lastMessageAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    isGroup: false,
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONVERSATIONS.filter(
    (c) =>
      !search ||
      c.user.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  function handleConversation(conv: Conversation) {
    router.push(`/conversation/${conv.id}`);
  }

  function renderItem({ item }: { item: Conversation }) {
    const timeAgo = formatDistanceToNow(new Date(item.lastMessageAt), {
      addSuffix: false,
      locale: ptBR,
    });

    return (
      <TouchableOpacity
        style={styles.convRow}
        onPress={() => handleConversation(item)}
        activeOpacity={0.85}
      >
        <View style={{ position: "relative" }}>
          <UserAvatar
            uri={item.user.avatar}
            name={item.user.name}
            size={52}
            isOnline={item.user.isOnline}
          />
          {item.isGroup && (
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>G</Text>
            </View>
          )}
        </View>

        <View style={styles.convContent}>
          <View style={styles.convTop}>
            <Text style={styles.convName} numberOfLines={1}>
              {item.user.name}
            </Text>
            <Text style={styles.convTime}>{timeAgo}</Text>
          </View>
          <View style={styles.convBottom}>
            <Text
              style={[
                styles.convMessage,
                item.unreadCount > 0 && styles.convMessageBold,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar conversas..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  groupBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  groupBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  convContent: { flex: 1 },
  convTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  convName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  convTime: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 8,
  },
  convBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  convMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
  },
  convMessageBold: {
    color: COLORS.text,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 80,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  fabText: { fontSize: 22 },
});
