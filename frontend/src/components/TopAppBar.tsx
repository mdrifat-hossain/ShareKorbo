import React, { useState } from "react";
import { Alert, View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

interface TopAppBarProps {
  onMenuPress?: () => void;
  onLogout?: () => void;
  onProfilePress?: () => void;
}

export default function TopAppBar({ onMenuPress, onLogout, onProfilePress }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [showMenu, setShowMenu] = useState(false);

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      setShowMenu(false);
      await AsyncStorage.multiRemove(["token", "user_id", "verification_status"]);
      onLogout?.();
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <View
      className="flex-row justify-between items-center px-6"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: 16,
          backgroundColor: colorScheme === "dark" ? "rgba(25, 28, 30, 0.9)" : "rgba(248, 249, 251, 0.9)",
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === "dark" ? "#2e3133" : "#f2f4f6",
        },
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
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e]"
          >
            <MaterialIcons name="account-circle" size={20} color="#757684" className="dark:text-[#c5c5d4]" />
          </TouchableOpacity>
          {showMenu && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 48,
                width: 160,
                borderRadius: 12,
                paddingVertical: 4,
                zIndex: 50,
                overflow: "hidden",
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
              className="bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e]"
            >
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  if (onProfilePress) {
                    onProfilePress();
                  } else {
                    (navigation.navigate as any)("UserProfile");
                  }
                }}
                className="px-4 py-3 active:bg-surface-container-low dark:active:bg-[#3f4345] flex-row items-center gap-2 border-b border-surface-container-low dark:border-[#191c1e]"
              >
                <MaterialIcons name="person" size={16} color="#757684" className="dark:text-[#c5c5d4]" />
                <Text className="text-sm font-semibold text-on-surface dark:text-[#f8f9fb]">Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="px-4 py-3 active:bg-surface-container-low dark:active:bg-[#3f4345] flex-row items-center gap-2"
              >
                <MaterialIcons name="exit-to-app" size={16} color="#ba1a1a" />
                <Text className="text-sm font-semibold text-error dark:text-[#ffb4ab]">Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
