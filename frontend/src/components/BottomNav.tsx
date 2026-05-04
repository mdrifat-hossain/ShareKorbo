import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", icon: "storefront" as const, route: "Marketplace" },
  { label: "Activity", icon: "swap-horizontal-circle" as const, route: "Activity" },
  { label: "Post", icon: "add-circle" as const, route: "CreateListing" },
  { label: "Inbox", icon: "chat-bubble" as const, route: "Inbox" },
  { label: "Profile", icon: "person" as const, route: "Profile" },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const currentRouteName = useNavigationState((state) =>
    state?.routes?.[state.index]?.name ?? ""
  );
  const insets = useSafeAreaInsets();

  return (
    <View
      className="lg:hidden absolute bottom-0 left-0 right-0 flex-row justify-around items-center px-4 pt-3 bg-background/90 dark:bg-on-background/90 rounded-t-[24px] z-50 border-t border-outline-variant/20 dark:border-[#3f4345] shadow-lg"
      style={[
        { paddingBottom: Math.max(insets.bottom, 20) },
        Platform.OS === "web" ? ({ backdropFilter: "blur(12px)" } as any) : {},
      ]}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = currentRouteName === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route as never)}
            className={`flex-col items-center gap-1 ${isActive ? "" : "opacity-60"}`}
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
