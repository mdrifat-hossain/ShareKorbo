import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

const NAV_ITEMS = [
  { label: "Marketplace", icon: "storefront" as const, route: "Marketplace" },
  { label: "Activity", icon: "swap-horizontal-circle" as const, route: "Activity" },
  { label: "Post Listing", icon: "add-circle" as const, route: "CreateListing" },
  { label: "Inbox", icon: "chat-bubble" as const, route: "Inbox" },
  { label: "Profile", icon: "person" as const, route: "Profile" },
];

export default function Sidebar() {
  const navigation = useNavigation();
  const currentRouteName = useNavigationState((state) =>
    state?.routes?.[state.index]?.name ?? ""
  );
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;

  return (
    <View
      className="w-64 bg-surface-container-low dark:bg-[#191c1e] flex-col px-6 hidden lg:flex border-r border-outline-variant/20 dark:border-[#3f4345] z-40"
      style={{
        paddingTop: Math.max(insets.top, 24),
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      {/* Logo */}
      <View className="mb-8">
        <Text className="font-headline font-extrabold text-primary dark:text-[#bcc2ff] text-2xl">
          Student Hub
        </Text>
        <Text className="text-xs opacity-60 font-medium uppercase tracking-widest text-on-background dark:text-white">
          Campus Pulse
        </Text>
      </View>

      {/* Nav Items */}
      <View className="flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentRouteName === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigation.navigate(item.route as never)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white dark:bg-primary shadow-sm"
                  : "opacity-70 hover:bg-surface-container-highest dark:hover:bg-[#2e3133]"
              }`}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={isActive ? (isLg ? "#2b3896" : "#ffffff") : "#191c1e"}
                className={isActive ? "dark:text-white" : "dark:text-[#f8f9fb]"}
              />
              <Text
                className={`font-body text-sm font-medium ${
                  isActive
                    ? "text-primary dark:text-white"
                    : "text-on-surface dark:text-[#f8f9fb]"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Profile Footer */}
      <View className="mt-auto pt-6 border-t border-outline-variant/20 dark:border-[#3f4345] flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
          <MaterialIcons name="account-circle" size={28} color="#ffffff" />
        </View>
        <View>
          <Text className="text-sm font-bold text-on-surface dark:text-white">User Profile</Text>
          <Text className="text-xs opacity-60 text-on-surface dark:text-white">Verified Student</Text>
        </View>
      </View>
    </View>
  );
}
