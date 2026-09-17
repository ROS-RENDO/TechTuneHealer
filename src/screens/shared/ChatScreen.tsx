import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../constants/theme";
import { useAuthStore } from "../../store";
import api from "../../services/api";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { bookingId } = route.params ?? {};
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!bookingId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchMessages = async () => {
    try {
      const data = await api.chat.getMessages(bookingId);
      setMessages(data);
    } catch {
      // Silently fail on polling errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    const text = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    try {
      const msg = await api.chat.sendMessage(bookingId, text, user?.name ?? "Me");
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setNewMessage(text); // restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageContainer, isMe ? styles.userMessage : styles.otherMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
        <Text style={[styles.messageText, isMe ? styles.userMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isMe && { color: "rgba(255,255,255,0.6)" }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Booking Chat</Text>
          <Text style={styles.headerSubtitle}>Booking #{bookingId?.slice(-6)}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.messagesList, messages.length === 0 && styles.emptyList]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            placeholderTextColor={colors.neutral[400]}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing["2xl"] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.neutral[500] },
  messagesList: { padding: spacing.md, gap: spacing.sm },
  emptyList: { flex: 1 },
  messageContainer: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userMessage: { alignSelf: "flex-end", backgroundColor: colors.primary[600], borderBottomRightRadius: 4 },
  otherMessage: { alignSelf: "flex-start", backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  senderName: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary[600], marginBottom: 2 },
  messageText: { fontSize: fontSize.base },
  userMessageText: { color: colors.white },
  otherMessageText: { color: colors.neutral[900] },
  timestamp: { fontSize: 10, color: colors.neutral[400], alignSelf: "flex-end", marginTop: 4 },
  emptyText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.neutral[500], marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, color: colors.neutral[400], marginTop: spacing.xs },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.neutral[900],
    maxHeight: 100,
    backgroundColor: colors.neutral[50],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: colors.neutral[300] },
});
