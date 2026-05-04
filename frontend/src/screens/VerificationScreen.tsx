import React from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        {/* NAVBAR */}
        {/* <View className="px-6 py-4 flex-row justify-between items-center border-b border-outline-variant/30 bg-surface-container-lowest">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-primary rounded-lg items-center justify-center">
              <Text className="text-white">🎓</Text>
            </View>
            <Text className="font-bold text-primary">
              Campus Pulse
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center">
              <Text>🔔</Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-primary-fixed-dim items-center justify-center">
              <Text className="text-primary text-xs font-bold">
                JS
              </Text>
            </View>
          </View>
        </View> */}
        
        {/* HEADER */}
        <View className="px-6 py-8 flex-row justify-between items-center">
          <Text className="text-2xl font-black text-primary">ShareKorbo</Text>
        </View>

        {/* MAIN */}
        <View className="max-w-4xl w-full self-center px-6 pt-12 pb-24 space-y-8">
          {/* HEADER */}
          <View className="items-center space-y-4">
            <View className="px-4 py-1.5 rounded-full bg-primary-fixed">
              <Text className="text-xs font-bold uppercase">
                Account Status
              </Text>
            </View>

            <Text className="text-3xl md:text-4xl font-extrabold text-primary text-center">
              Hold tight! We're reviewing your credentials.
            </Text>

            <Text className="text-on-surface-variant text-center max-w-2xl">
              Welcome to the Pulse! We manually verify every student profile.
            </Text>
          </View>

          {/* STATUS CARD */}
          <View className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/20 flex flex-col md:flex-row items-center gap-6">
            {/* ICON */}
            <View className="items-center">
              <View className="w-28 h-28 rounded-full border-4 border-primary-fixed items-center justify-center">
                <Text className="text-4xl text-primary">⏳</Text>
              </View>
            </View>

            {/* TEXT */}
            <View className="flex-1 items-center md:items-start">
              <Text className="text-2xl font-bold text-on-surface">
                Pending Review
              </Text>

              <Text className="text-on-surface-variant mt-1">
                Estimated review time:{" "}
                <Text className="text-primary font-semibold">12–24 hours</Text>
              </Text>

              <View className="mt-2 px-3 py-1 bg-surface-container-high rounded-lg">
                <Text className="text-xs text-on-surface-variant">
                  Last updated: Today, 10:45 AM
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <Pressable className="px-6 py-3 border border-outline-variant rounded-xl">
              <Text className="text-primary font-bold">Update Documents</Text>
            </Pressable>
          </View>

          {/* TIMELINE */}
          <View className="bg-surface-container-low p-8 rounded-[32px]">
            <Text className="font-bold text-xl text-primary mb-6">
              Your Verification Journey
            </Text>

            <View className="space-y-8">
              {/* STEP 1 */}
              <View className="flex-row gap-4">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white">⏳</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-primary">Pending Review</Text>
                  <Text className="text-on-surface-variant">
                    Our moderators are reviewing your documents.
                  </Text>
                </View>
              </View>

              {/* STEP 2 */}
              <View className="flex-row gap-4 opacity-40">
                <View className="w-10 h-10 rounded-full bg-outline-variant items-center justify-center">
                  <Text className="text-white">✔</Text>
                </View>
                <View>
                  <Text className="font-bold">Verified</Text>
                </View>
              </View>

              {/* STEP 3 */}
              <View className="flex-row gap-4 opacity-40">
                <View className="w-10 h-10 rounded-full bg-outline-variant items-center justify-center">
                  <Text className="text-white">❌</Text>
                </View>
                <View>
                  <Text className="font-bold">Rejected (If Issues Found)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* TIP */}
          <View className="bg-secondary-fixed/20 p-6 rounded-[24px] flex-row gap-4">
            <Text>💡</Text>
            <Text className="text-sm flex-1">
              You can browse marketplace while waiting. You'll be notified once
              approved.
            </Text>
          </View>

          {/* SUPPORT */}
          <View className="items-center">
            <Text className="text-primary font-semibold">
              Contact Support →
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
