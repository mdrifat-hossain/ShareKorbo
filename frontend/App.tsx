import "react-native-gesture-handler";
import "./global.css";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View } from "react-native";
import { useColorScheme } from "nativewind";

import AuthStack from "./src/navigation/AuthStack";

export default function App() {
  const { colorScheme } = useColorScheme();

  return (
    <View className={colorScheme === "dark" ? "dark flex-1" : "flex-1"}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </View>
  );
}