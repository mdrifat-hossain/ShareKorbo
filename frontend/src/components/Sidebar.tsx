import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

type SidebarRoute = "Marketplace" | "Activity" | "CreateListing" | "Inbox";

const NAV_ITEMS = [
  { label: "Marketplace", icon: "storefront" as const, route: "Marketplace" as const },
  { label: "Activity", icon: "swap-horizontal-circle" as const, route: "Activity" as const },
  { label: "Post Listing", icon: "add-circle" as const, route: "CreateListing" as const },
  { label: "Inbox", icon: "chat-bubble" as const, route: "Inbox" as const },
];

interface SidebarProps {
  activeRoute?: SidebarRoute;
  onNavigate: (route: SidebarRoute) => void;
}

export default function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation();

  return (
    <View
      className="w-64 bg-surface-container-low dark:bg-[#191c1e] flex-col px-6 hidden lg:flex"
      style={{
        paddingTop: Math.max(insets.top, 24),
        paddingBottom: Math.max(insets.bottom, 24),
        zIndex: 40,
        borderRightWidth: 1,
        borderRightColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
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
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => onNavigate(item.route)}
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
              style={[
                isActive
                  ? {
                      backgroundColor: isDark ? "#2b3896" : "#ffffff",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : {
                      opacity: 0.7,
                    },
              ]}
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
      <TouchableOpacity
        onPress={() => (navigation.navigate as any)("UserProfile")}
        className="mt-auto pt-6 flex-row items-center gap-3 active:opacity-80"
        style={{
          borderTopWidth: 1,
          borderTopColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
        }}
      >
        <View className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
          <MaterialIcons name="account-circle" size={28} color="#ffffff" />
        </View>
        <View>
          <Text className="text-sm font-bold text-on-surface dark:text-white">User Profile</Text>
          <Text className="text-xs opacity-60 text-on-surface dark:text-white">Verified Student</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
