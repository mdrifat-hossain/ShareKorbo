import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen({ navigation }: any) {
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 1024; // lg breakpoint

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* HEADER */}
        <View className="px-6 py-8 flex-row justify-between items-center">
          <Text className="text-2xl font-black text-primary">ShareKorbo</Text>

          {isLargeScreen && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-outline">Campus Marketplace</Text>
              <View className="w-2 h-2 rounded-full bg-secondary" />
            </View>
          )}
        </View>

        {/* MAIN */}
        <View className="flex-1 items-center justify-center px-4 py-12">
          <View
            className="w-full max-w-6xl flex-row gap-12 items-center"
            style={{ flexDirection: isLargeScreen ? "row" : "column" }}
          >
            {/* ================= LEFT SIDE ================= */}
            {isLargeScreen && (
              <View className="flex-1 space-y-8 pr-12">
                {/* Badge */}
                <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-secondary-fixed self-start">
                  <Text className="text-xs font-semibold uppercase">
                    ✔ Verified Student Network
                  </Text>
                </View>

                {/* Title */}
                <Text className="text-5xl font-extrabold text-on-surface leading-tight">
                  The Curated{" "}
                  <Text className="text-primary italic">Exchange</Text> for
                  Academics.
                </Text>

                {/* Description */}
                <Text className="text-lg text-on-surface-variant max-w-md">
                  Join thousands of students buying, selling, and sharing
                  resources within a trusted university ecosystem.
                </Text>

                {/* Features */}
                <View className="flex-row gap-4">
                  <View className="flex-1 p-6 rounded-xl bg-surface-container-low">
                    <Text className="text-3xl mb-2">🎓</Text>
                    <Text className="font-bold text-lg">
                      Academic Integrity
                    </Text>
                    <Text className="text-sm text-on-surface-variant">
                      Verified campus identities only.
                    </Text>
                  </View>

                  <View className="flex-1 p-6 rounded-xl bg-surface-container-low">
                    <Text className="text-3xl mb-2">🌱</Text>
                    <Text className="font-bold text-lg">Sustainable Loop</Text>
                    <Text className="text-sm text-on-surface-variant">
                      Extend the life of campus goods.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ================= RIGHT SIDE (LOGIN CARD) ================= */}
            <View className="w-full max-w-[480px] bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10">
              <View className="mb-10">
                <Text className="text-4xl font-extrabold text-on-surface mb-3">
                  Welcome Back
                </Text>
                <Text className="text-on-surface-variant">
                  Login to access your campus marketplace
                </Text>
              </View>

              <View className="space-y-6">
                {/* Email */}
                <View>
                  <Text className="text-sm mb-2">Student ID or Email</Text>
                  <TextInput
                    placeholder="e.g. 2024-1-2345"
                    className="pl-4 py-4 bg-surface-container-highest rounded-xl"
                  />
                </View>

                {/* Password */}
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text>Password</Text>
                    <Text className="text-primary text-xs">Forgot?</Text>
                  </View>
                  <TextInput
                    secureTextEntry
                    placeholder="••••••••"
                    className="pl-4 py-4 bg-surface-container-highest rounded-xl"
                  />
                </View>

                {/* Remember */}
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border rounded mr-2" />
                  <Text className="text-sm">Remember my device</Text>
                </View>

                {/* Button */}
                <LinearGradient
                  colors={["#2b3896", "#4551af"]}
                  className="py-4 rounded-xl items-center"
                >
                  <Pressable
                    // onPress={() => navigation.navigate("Verification")}
                    onPress={() => navigation.navigate("Marketplace")}
                  >
                    <Text className="text-white font-bold">Login →</Text>
                  </Pressable>
                </LinearGradient>

                {/* Divider */}
                <View className="flex-row items-center my-4">
                  <View className="flex-1 border-t" />
                  <Text className="mx-3 text-xs">OR LOGIN WITH</Text>
                  <View className="flex-1 border-t" />
                </View>

                {/* Social */}
                <View className="flex-row gap-4">
                  <Pressable className="flex-1 border rounded-xl py-3 items-center">
                    <Text>Google</Text>
                  </Pressable>
                  <Pressable className="flex-1 border rounded-xl py-3 items-center">
                    <Text>EduPass</Text>
                  </Pressable>
                </View>
              </View>

              {/* Signup */}
              <View className="mt-10 items-center">
                <Text>Don't have an account?</Text>
                <Pressable onPress={() => navigation.navigate("Register")}>
                  <Text className="text-primary font-bold">Sign Up</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View className="py-8 items-center">
          <Text className="text-xs text-outline">
            © 2024 ShareKorbo Campus Solutions. Built for Students.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
