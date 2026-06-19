import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

import { BASE_URL } from "../utils/config";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConvSummary {
  conversation_id: number;
  listing_id: number;
  listing_title: string;
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  sent_count: number;
  received_count: number;
}

interface ChatMessage {
  message_id: number;
  sender_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Navigation params (set when coming from ResourceDetailsScreen)
  const params = (route.params as any) || {};

  // ── Core state ──────────────────────────────────────────────────────────────
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "sent" | "received">("all");

  const scrollViewRef = useRef<ScrollView>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Active conversation object ───────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.conversation_id === activeConvId) ?? null;

  // ── Layout helpers ───────────────────────────────────────────────────────────
  const showList = !activeConvId || isMd;
  const showChat = !!activeConvId;

  // ── Total counts for filter chips ────────────────────────────────────────────
  const totalSent = conversations.reduce((s, c) => s + c.sent_count, 0);
  const totalReceived = conversations.reduce((s, c) => s + c.received_count, 0);

  // ── Filtered conversations ───────────────────────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.other_user_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (selectedFilter === "sent") return matchesSearch && c.sent_count > 0;
    if (selectedFilter === "received") return matchesSearch && c.received_count > 0;
    return matchesSearch;
  });

  // ── Fetch helpers ────────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async (uid: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/inbox/conversations/${uid}`);
      if (Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (e) {
      console.log("fetchConversations error", e);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/inbox/messages/${convId}`);
      if (Array.isArray(res.data)) {
        setMessages(res.data);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 80);
      }
    } catch (e) {
      console.log("fetchMessages error", e);
    }
  }, []);

  // ── Start / stop polling ────────────────────────────────────────────────────

  const startPolling = useCallback(
    (convId: number) => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(convId);
      }, 5000);
    },
    [fetchMessages]
  );

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── Open / select a conversation ────────────────────────────────────────────

  const selectConversation = useCallback(
    async (convId: number, uid: number) => {
      setActiveConvId(convId);
      setLoadingMsgs(true);
      stopPolling();
      try {
        await fetchMessages(convId);
        // Mark as read
        await axios.post(`${BASE_URL}/inbox/mark-read/${convId}/${uid}`).catch(() => {});
        // Refresh conversation list so unread badge clears
        await fetchConversations(uid);
      } finally {
        setLoadingMsgs(false);
      }
      startPolling(convId);
    },
    [fetchMessages, fetchConversations, startPolling, stopPolling]
  );

  // ── Open-or-create conversation from nav params ─────────────────────────────

  const openFromParams = useCallback(
    async (uid: number) => {
      const { listing_id, owner_id, listing_title } = params;
      if (!listing_id || !owner_id) return;
      if (uid === Number(owner_id)) return; // can't chat with yourself

      try {
        const res = await axios.post(`${BASE_URL}/inbox/conversation/open`, {
          listing_id,
          owner_id,
          buyer_id: uid,
          listing_title: listing_title ?? "this listing",
        });
        if (res.data?.conversation_id) {
          await fetchConversations(uid);
          selectConversation(res.data.conversation_id, uid);
        }
      } catch (e) {
        console.log("openFromParams error", e);
      }
    },
    [params, fetchConversations, selectConversation]
  );

  // ── Mount: load user → conversations → maybe open from params ───────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const idStr = await AsyncStorage.getItem("user_id");
      if (!idStr || cancelled) return;
      const uid = Number(idStr);
      setCurrentUserId(uid);

      setLoadingConvs(true);
      await fetchConversations(uid);
      setLoadingConvs(false);

      if (params.listing_id && params.owner_id) {
        await openFromParams(uid);
      }
    })();
    return () => {
      cancelled = true;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConvId || !currentUserId) return;
    const text = inputText.trim();
    setInputText("");

    try {
      await axios.post(`${BASE_URL}/inbox/messages`, {
        conversation_id: activeConvId,
        sender_id: currentUserId,
        message_text: text,
      });
      // Immediately fetch so the sender sees the message
      await fetchMessages(activeConvId);
      await fetchConversations(currentUserId);
    } catch (e) {
      console.log("sendMessage error", e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-surface dark:bg-[#191c1e] overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar
          activeRoute="Inbox"
          onNavigate={(route) => (navigation.navigate as any)(route)}
        />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          <TopAppBar
            onMenuPress={() => navigation.goBack()}
            onLogout={() =>
              (navigation as any).reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            }
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 flex-row"
            style={{
              paddingTop: insets.top > 0 ? insets.top + 70 : 80,
              paddingBottom: isLg ? 0 : insets.bottom > 0 ? insets.bottom + 70 : 85,
            }}
          >
            {/* ── Left Pane: Conversation List ─────────────────────────────── */}
            {showList && (
              <View
                className="h-full bg-surface-container-low dark:bg-[#2d3133]"
                style={{
                  width: isMd ? (isLg ? 400 : 350) : "100%",
                  borderRightWidth: 1,
                  borderRightColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.1)",
                }}
              >
                <View className="p-6 pb-3">
                  {/* Header */}
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-headline font-bold text-xl text-on-surface dark:text-[#f8f9fb]">
                      Inbox
                    </Text>
                    {conversations.filter((c) => c.unread_count > 0).length > 0 && (
                      <View className="bg-primary dark:bg-[#bcc2ff] px-2 py-1 rounded-full items-center justify-center">
                        <Text className="text-white dark:text-[#000c62] text-[10px] font-bold">
                          {conversations.filter((c) => c.unread_count > 0).length} NEW
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Search */}
                  <View className="flex-row items-center bg-surface-container-highest dark:bg-[#2d3133] rounded-xl px-3 h-10 mb-4">
                    <MaterialIcons name="search" size={18} color="#757684" />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search conversations..."
                      placeholderTextColor="#757684"
                      className="flex-1 ml-2 text-sm text-on-surface dark:text-white bg-transparent outline-none"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <MaterialIcons name="close" size={16} color="#757684" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Filter Chips */}
                  <View className="flex-row gap-2">
                    {(
                      [
                        { key: "all", label: "All", count: totalSent + totalReceived },
                        { key: "sent", label: "Sent", count: totalSent },
                        { key: "received", label: "Received", count: totalReceived },
                      ] as const
                    ).map((f) => (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => setSelectedFilter(f.key)}
                        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                          selectedFilter === f.key
                            ? "bg-primary dark:bg-[#bcc2ff] border-primary dark:border-[#bcc2ff]"
                            : ""
                        }`}
                        style={
                          selectedFilter !== f.key
                            ? {
                                backgroundColor: isDark ? "rgba(37, 40, 42, 0.5)" : "#ffffff",
                                borderColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
                              }
                            : undefined
                        }
                      >
                        <Text
                          className={`text-[11px] font-semibold ${
                            selectedFilter === f.key
                              ? "text-white dark:text-[#000c62]"
                              : "text-on-surface-variant dark:text-[#c5c5d4]"
                          }`}
                        >
                          {f.label}
                        </Text>
                        <View
                          className="px-1.5 py-0.5 rounded-full"
                          style={
                            selectedFilter === f.key
                              ? {
                                  backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)",
                                }
                              : {
                                  backgroundColor: isDark ? "#3f4345" : "#e6e8ea",
                                }
                          }
                        >
                          <Text
                            className={`text-[9px] font-bold ${
                              selectedFilter === f.key
                                ? "text-white dark:text-[#000c62]"
                                : "text-on-surface-variant dark:text-[#c5c5d4]"
                            }`}
                          >
                            {f.count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Conversation list */}
                <ScrollView className="flex-1 px-3 pb-6" showsVerticalScrollIndicator={false}>
                  <View className="space-y-1 gap-2">
                    {loadingConvs ? (
                      <View className="items-center py-10">
                        <ActivityIndicator size="small" color="#2b3896" />
                      </View>
                    ) : filteredConversations.length === 0 ? (
                      <View className="items-center justify-center py-10">
                        <MaterialIcons name="search-off" size={32} color="#757684" />
                        <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-sm mt-2">
                          No conversations found
                        </Text>
                      </View>
                    ) : (
                      filteredConversations.map((c) => {
                        const isActive = c.conversation_id === activeConvId;
                        return (
                          <TouchableOpacity
                            key={c.conversation_id}
                            onPress={() =>
                              currentUserId && selectConversation(c.conversation_id, currentUserId)
                            }
                            style={
                              isActive
                                ? {
                                    backgroundColor: isDark ? "#191c1e" : "#ffffff",
                                    borderLeftWidth: 4,
                                    borderLeftColor: isDark ? "#bcc2ff" : "#2b3896",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                  }
                                : {
                                    backgroundColor: isDark ? "rgba(37, 40, 42, 0.5)" : "transparent",
                                  }
                            }
                            className="rounded-xl p-4"
                          >
                            <View className="flex-row gap-4">
                              {/* Avatar placeholder with initials */}
                              <View className="relative shrink-0">
                                <View className="w-12 h-12 rounded-full bg-primary-container dark:bg-[#3f4345] items-center justify-center">
                                  <Text className="text-white font-bold text-base">
                                    {c.other_user_name.slice(0, 2).toUpperCase()}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-1 min-w-0">
                                <View className="flex-row justify-between items-start mb-1">
                                  <Text
                                    className="font-bold text-on-surface dark:text-[#f8f9fb] truncate font-headline"
                                    numberOfLines={1}
                                  >
                                    {c.other_user_name}
                                  </Text>
                                  <View className="flex-row items-center gap-1">
                                    {c.unread_count > 0 && (
                                      <View className="bg-primary dark:bg-[#bcc2ff] w-4 h-4 rounded-full items-center justify-center mr-1">
                                        <Text className="text-white dark:text-[#000c62] text-[8px] font-bold">
                                          {c.unread_count}
                                        </Text>
                                      </View>
                                    )}
                                    <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] font-medium">
                                      {c.last_message_time}
                                    </Text>
                                  </View>
                                </View>

                                <Text
                                  className={`text-sm truncate mb-1 ${
                                    isActive
                                      ? "text-primary dark:text-[#bcc2ff] font-semibold"
                                      : "text-on-surface-variant dark:text-[#c5c5d4]"
                                  }`}
                                  numberOfLines={1}
                                >
                                  {c.listing_title}{" "}
                                  <Text className="text-[10px] font-normal opacity-60">
                                    #{c.listing_id}
                                  </Text>
                                </Text>

                                <Text
                                  className="text-xs text-on-surface-variant dark:text-[#c5c5d4] truncate"
                                  numberOfLines={1}
                                >
                                  {c.last_message}
                                </Text>

                                {/* Sent / Received count badges */}
                                <View className="flex-row gap-2 mt-2">
                                  <View
                                    className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: isDark ? "rgba(188, 194, 255, 0.1)" : "rgba(43, 56, 150, 0.1)",
                                    }}
                                  >
                                    <MaterialIcons name="arrow-upward" size={9} color="#2b3896" />
                                    <Text className="text-[9px] font-bold text-primary dark:text-[#bcc2ff]">
                                      {c.sent_count} Sent
                                    </Text>
                                  </View>
                                  <View
                                    className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: isDark ? "rgba(141, 245, 228, 0.1)" : "rgba(0, 107, 95, 0.1)",
                                    }}
                                  >
                                    <MaterialIcons name="arrow-downward" size={9} color="#005048" />
                                    <Text className="text-[9px] font-bold text-secondary dark:text-[#8df5e4]">
                                      {c.received_count} Received
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* ── Right Pane: Active Chat ──────────────────────────────────── */}
            {showChat && activeConv && (
              <View className="flex-1 flex-col bg-surface dark:bg-[#191c1e] h-full relative">
                {/* Chat Header */}
                <View
                  className="px-8 py-6 flex-row items-center justify-between"
                  style={{
                    backgroundColor: isDark ? "rgba(25, 28, 30, 0.8)" : "rgba(248, 249, 251, 0.8)",
                    zIndex: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#2e3133" : "#e6e8ea",
                  }}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    {/* Back button on mobile */}
                    {!isMd && (
                      <TouchableOpacity
                        onPress={() => {
                          stopPolling();
                          setActiveConvId(null);
                        }}
                        className="p-2 mr-1 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] active:scale-95"
                      >
                        <MaterialIcons name="arrow-back" size={20} color="#454652" />
                      </TouchableOpacity>
                    )}

                    <View className="w-12 h-12 rounded-full bg-primary-container dark:bg-[#3f4345] items-center justify-center shrink-0">
                      <Text className="text-white font-bold text-base">
                        {activeConv.other_user_name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1 min-w-0">
                      <Text
                        className="font-headline font-bold text-lg text-on-surface dark:text-[#f8f9fb]"
                        numberOfLines={1}
                      >
                        {activeConv.other_user_name}
                      </Text>
                      <Text
                        className="text-sm font-medium text-primary dark:text-[#bcc2ff]"
                        numberOfLines={1}
                      >
                        Discussing:{" "}
                        <Text className="italic">{activeConv.listing_title}</Text>
                        <Text className="not-italic opacity-60"> #{activeConv.listing_id}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Polling indicator */}
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-secondary dark:bg-[#8df5e4] opacity-80" />
                    <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4]">
                      Live
                    </Text>
                  </View>
                </View>

                {/* Messages Area */}
                {loadingMsgs ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2b3896" />
                  </View>
                ) : (
                  <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 p-8"
                    style={{
                      backgroundColor: isDark ? "rgba(45, 49, 51, 0.1)" : "rgba(242, 244, 246, 0.3)",
                    }}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                      scrollViewRef.current?.scrollToEnd({ animated: false })
                    }
                  >
                    {messages.length === 0 && (
                      <View className="items-center justify-center py-16">
                        <MaterialIcons name="chat-bubble-outline" size={40} color="#757684" />
                        <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-sm mt-3">
                          No messages yet
                        </Text>
                      </View>
                    )}

                    <View className="space-y-6 gap-6">
                      {messages.map((m, idx) => {
                        const isMe = m.sender_id === currentUserId;
                        if (isMe) {
                          return (
                            <View
                              key={m.message_id || idx}
                              className="flex-col items-end gap-1 self-end max-w-[80%]"
                            >
                              <View className="bg-primary dark:bg-primary-container p-4 rounded-2xl rounded-br-none shadow-md">
                                <Text className="text-sm leading-relaxed text-white dark:text-[#cbcfff] font-body">
                                  {m.message_text}
                                </Text>
                              </View>
                              <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] font-medium pr-1 mt-1">
                                {m.created_at} {m.is_read ? "· Read" : ""}
                              </Text>
                            </View>
                          );
                        } else {
                          return (
                            <View
                              key={m.message_id || idx}
                              className="flex-row items-end gap-3 max-w-[80%]"
                            >
                              <View className="w-8 h-8 rounded-full bg-primary-container dark:bg-[#3f4345] items-center justify-center mb-1 shrink-0">
                                <Text className="text-white text-[10px] font-bold">
                                  {activeConv.other_user_name.slice(0, 2).toUpperCase()}
                                </Text>
                              </View>
                              <View className="space-y-1 flex-1">
                                <View
                                  className="p-4 rounded-2xl rounded-bl-none"
                                  style={{
                                    backgroundColor: isDark ? "#191c1e" : "#ffffff",
                                    borderWidth: 1,
                                    borderColor: isDark ? "transparent" : "rgba(197, 197, 212, 0.05)",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 1,
                                  }}
                                >
                                  <Text className="text-sm leading-relaxed text-on-surface dark:text-[#f8f9fb] font-body">
                                    {m.message_text}
                                  </Text>
                                </View>
                                <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] font-medium pl-1 mt-1">
                                  {m.created_at}
                                </Text>
                              </View>
                            </View>
                          );
                        }
                      })}
                    </View>
                  </ScrollView>
                )}

                {/* Input Area — text only */}
                <View className="p-6 bg-surface dark:bg-[#191c1e] border-t border-surface-container-high dark:border-[#2e3133]">
                  <View className="bg-surface-container-highest dark:bg-[#2d3133] rounded-xl p-2 flex-row items-center gap-2 shadow-inner">
                    <TextInput
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={handleSendMessage}
                      className="flex-1 bg-transparent border-none text-sm py-3 px-4 text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-[#c5c5d4]/50 outline-none"
                      placeholder="Type a message..."
                      placeholderTextColor="#757684"
                    />
                    <TouchableOpacity
                      onPress={handleSendMessage}
                      className="bg-primary dark:bg-primary-container text-on-primary p-3 rounded-xl items-center justify-center shadow-lg active:scale-95"
                    >
                      <MaterialIcons name="send" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Empty state when no conversation is selected on desktop */}
            {!showChat && isMd && (
              <View className="flex-1 items-center justify-center bg-surface dark:bg-[#191c1e]">
                <MaterialIcons name="chat-bubble-outline" size={56} color="#757684" />
                <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-lg mt-4 font-headline">
                  Select a conversation
                </Text>
                <Text className="text-on-surface-variant/60 dark:text-[#c5c5d4]/60 text-sm mt-1">
                  or start one from a listing page
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>

          <BottomNav
            activeRoute="Inbox"
            onNavigate={(route) => (navigation.navigate as any)(route)}
          />
        </View>
      </View>
    </View>
  );
}
