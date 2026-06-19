import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

type BottomNavRoute = "Marketplace" | "Activity" | "CreateListing" | "Inbox";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", icon: "storefront" as const, route: "Marketplace" as const },
  { label: "Activity", icon: "swap-horizontal-circle" as const, route: "Activity" as const },
  { label: "Post", icon: "add-circle" as const, route: "CreateListing" as const },
  { label: "Inbox", icon: "chat-bubble" as const, route: "Inbox" as const },
];

interface BottomNavProps {
  activeRoute?: BottomNavRoute;
  onNavigate: (route: BottomNavRoute) => void;
}

export default function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="lg:hidden flex-row justify-around items-center px-4 pt-3 rounded-t-[24px]"
      style={[
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: isDark ? "rgba(25, 28, 30, 0.9)" : "rgba(248, 249, 251, 0.9)",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
          paddingBottom: Math.max(insets.bottom, 20),
        },
        Platform.OS === "web" ? ({ backdropFilter: "blur(12px)" } as any) : {},
      ]}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = activeRoute === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => onNavigate(item.route)}
            style={{ opacity: isActive ? 1 : 0.6 }}
            className="flex-col items-center gap-1"
          >
            <MaterialIcons
              name={item.icon}
              size={24}
              color={isActive ? "#2b3896" : "#454652"}
              className={isActive ? "dark:text-[#bcc2ff]" : "dark:text-[#c5c5d4]"}
            />
            <Text
              className={`text-[10px] font-bold font-body ${
                isActive
                  ? "text-primary dark:text-[#bcc2ff]"
                  : "text-[#454652] dark:text-[#c5c5d4]"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
