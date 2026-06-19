import "react-native-gesture-handler";
import "./global.css";

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthStack from "./src/navigation/AuthStack";

export default function App() {
  const { colorScheme } = useColorScheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const isDark = colorScheme === "dark";

  // On app start, check if user is already logged in
  // This prevents logout-on-reload by reading persisted AsyncStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("user_id");
        const verificationStatus = await AsyncStorage.getItem("verification_status");

        if (token && userId) {
          // User is already logged in — route to correct screen
          if (verificationStatus === "pending") {
            setInitialRoute("Verification");
          } else {
            setInitialRoute("Marketplace");
          }
        } else {
          setInitialRoute("Login");
        }
      } catch (e) {
        setInitialRoute("Login");
      }
    };
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#191c1e" : "#f8f9fb" },
        ]}
      >
        <NavigationContainer>
          {initialRoute ? (
            <AuthStack initialRouteName={initialRoute as any} />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#2b3896" />
            </View>
          )}
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});