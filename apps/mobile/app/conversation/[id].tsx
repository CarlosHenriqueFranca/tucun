import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS } from "../../src/constants";
import { UserAvatar } from "../../src/components/user-avatar";
import { useAuthStore } from "../../src/store/auth.store";

const { width: W } = Dimensions.get("window");
const MAX_BUBBLE_WIDTH = W * 0.72;

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  imageUrl?: string;
  createdAt: string;
  isOwn: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "u1",
    senderName: "João Pescador",
    senderAvatar: null,
    text: "E aí brother, foi pescar hoje?",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    isOwn: false,
  },
  {
    id: "2",
    senderId: "me",
    senderName: "Eu",
    senderAvatar: null,
    text: "Fui sim! Peguei dois tucunarés lá no Madeira 🎣",
    createdAt: new Date(Date.now() - 3500 * 1000).toISOString(),
    isOwn: true,
  },
  {
    id: "3",
    senderId: "u1",
    senderName: "João Pescador",
    senderAvatar: null,
    text: "Cara, que inveja! Qual isca você usou?",
    createdAt: new Date(Date.now() - 3400 * 1000).toISOString(),
    isOwn: false,
  },
  {
    id: "4",
    senderId: "me",
    senderName: "Eu",
    senderAvatar: null,
    text: "Colher dourada, tamanho 20g. Funciona demais nessa época!",
    createdAt: new Date(Date.now() - 3300 * 1000).toISOString(),
    isOwn: true,
  },
  {
    id: "5",
    senderId: "u1",
    senderName: "João Pescador",
    senderAvatar: null,
    text: "Cara, o tucunaré tá na boca do rio agora! 🎣",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isOwn: false,
  },
];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");

  const otherUser = {
    name: "João Pescador",
    avatar: null,
    isOnline: true,
  };

  useEffect(() => {
    // In production: connect Socket.io here
    // const socket = io(API_URL);
    // socket.emit('join', { conversationId: id });
    // socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
    // return () => socket.disconnect();
  }, [id]);

  function handleSend() {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id ?? "me",
      senderName: user?.name ?? "Eu",
      senderAvatar: user?.avatar ?? null,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // In production: emit via Socket.io
    // socket.emit('sendMessage', { conversationId: id, text: inputText.trim() });

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const prev = messages[index - 1];
    const showAvatar = !item.isOwn && (!prev || prev.senderId !== item.senderId);
    const showTime =
      !messages[index + 1] ||
      new Date(messages[index + 1].createdAt).getTime() -
        new Date(item.createdAt).getTime() >
        5 * 60 * 1000;

    const timeStr = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
      locale: ptBR,
    });

    return (
      <View
        style={[
          styles.messageRow,
          item.isOwn ? styles.messageRowOwn : styles.messageRowOther,
        ]}
      >
        {/* Avatar for other person */}
        {!item.isOwn && (
          <View style={styles.avatarSpace}>
            {showAvatar && (
              <UserAvatar uri={item.senderAvatar} name={item.senderName} size={32} />
            )}
          </View>
        )}

        <View style={{ maxWidth: MAX_BUBBLE_WIDTH }}>
          {/* Sender name (for groups / first in sequence) */}
          {showAvatar && !item.isOwn && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}

          {/* Bubble */}
          <View
            style={[
              styles.bubble,
              item.isOwn ? styles.bubbleOwn : styles.bubbleOther,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
              ]}
            >
              {item.text}
            </Text>
          </View>

          {/* Timestamp */}
          {showTime && (
            <Text
              style={[styles.time, item.isOwn && { textAlign: "right" }]}
            >
              {timeStr}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <UserAvatar
          uri={otherUser.avatar}
          name={otherUser.name}
          size={40}
          isOnline={otherUser.isOnline}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser.name}</Text>
          <Text style={styles.headerStatus}>
            {otherUser.isOnline ? "Online agora" : "Offline"}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mensagem..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: { padding: 4 },
  backIcon: {
    color: COLORS.secondary,
    fontSize: 22,
    fontWeight: "700",
  },
  headerInfo: { flex: 1 },
  headerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  headerStatus: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  avatarSpace: {
    width: 38,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  senderName: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 2,
  },
  bubbleOwn: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextOwn: { color: COLORS.text },
  bubbleTextOther: { color: COLORS.text },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  attachBtn: { paddingBottom: 10 },
  attachIcon: { fontSize: 22 },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 2,
  },
});
