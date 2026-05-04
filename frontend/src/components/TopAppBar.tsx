import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

interface TopAppBarProps {
  onMenuPress?: () => void;
}

export default function TopAppBar({ onMenuPress }: TopAppBarProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 bg-background/90 dark:bg-on-background/90 flex-row justify-between items-center px-6 border-b border-surface-container-low dark:border-[#2e3133]"
      style={[
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 },
        Platform.OS === "web" ? ({ backdropFilter: "blur(12px)" } as any) : {},
      ]}
    >
      {/* Left: hamburger + title */}
      <View className="flex-row items-center gap-3 flex-1 mr-2 shrink-1">
        <TouchableOpacity
          onPress={onMenuPress}
          className="p-2 lg:hidden rounded-full active:scale-95 bg-surface-container-lowest dark:bg-[#2d3133]"
        >
          <MaterialIcons name="menu" size={24} color="#454652" className="dark:text-[#c5c5d4]" />
        </TouchableOpacity>
        <Text
          className="text-lg md:text-xl font-extrabold text-primary dark:text-[#bcc2ff] tracking-tight font-headline flex-shrink"
          numberOfLines={1}
        >
          The Academic Commons
        </Text>
      </View>

      {/* Right: theme toggle, notifications, profile */}
      <View className="flex-row items-center gap-2 shrink-0">
        <TouchableOpacity
          onPress={toggleTheme}
          className="p-2 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e]"
        >
          <MaterialIcons
            name={colorScheme === "dark" ? "light-mode" : "dark-mode"}
            size={20}
            color={colorScheme === "dark" ? "#c4c7c9" : "#44474a"}
          />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e]">
          <MaterialIcons name="notifications" size={20} color="#757684" className="dark:text-[#c5c5d4]" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e]">
          <MaterialIcons name="account-circle" size={20} color="#757684" className="dark:text-[#c5c5d4]" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
