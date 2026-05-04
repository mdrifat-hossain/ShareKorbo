import React from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* HEADER */}
        <View className="px-6 py-8 flex-row justify-between items-center">
          <Text className="text-2xl font-black text-primary">ShareKorbo</Text>
        </View>

        <View className="max-w-4xl w-full self-center px-6 py-12 md:py-20">
          {/* HEADER */}
          <View className="items-center space-y-4 max-w-2xl self-center mb-12">
            <View className="px-4 py-1.5 rounded-full bg-secondary-fixed">
              <Text className="text-xs font-bold tracking-wider uppercase text-on-secondary-fixed">
                New Registration
              </Text>
            </View>

            <Text className="text-4xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
              Join the Campus Pulse Community
            </Text>

            <Text className="text-on-surface-variant text-lg text-center">
              Create your student account to start sharing and connecting with
              your campus.
            </Text>
          </View>

          {/* CARD */}
          <View
            className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant/10"
            style={{
              shadowColor: "#191c1e",
              shadowOpacity: 0.06,
              shadowRadius: 32,
              shadowOffset: { width: 0, height: 12 },
              elevation: 6,
            }}
          >
            {/* FORM */}
            <View className="space-y-8">
              {/* UPLOAD SECTION */}
              <View className="space-y-4">
                <Text className="font-bold text-primary text-sm uppercase tracking-wide">
                  Student ID Card Photo
                </Text>

                <Pressable className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 items-center">
                  <View className="w-16 h-16 bg-primary-fixed rounded-full items-center justify-center mb-3">
                    <Text className="text-primary text-2xl">📷</Text>
                  </View>

                  <Text className="font-bold text-on-surface text-base">
                    Upload Student ID Photo
                  </Text>

                  <Text className="text-sm text-on-surface-variant text-center">
                    Click to browse JPG or PNG
                  </Text>
                </Pressable>

                <Text className="text-xs italic text-on-surface-variant">
                  Make sure your name and university logo are clearly visible.
                </Text>
              </View>

              {/* INPUTS */}
              <View className="space-y-6">
                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    University Name
                  </Text>
                  <TextInput
                    placeholder="e.g. Stanford University"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    Student ID Number
                  </Text>
                  <TextInput
                    placeholder="e.g. 12345678"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    University Email
                  </Text>
                  <TextInput
                    placeholder="name@university.edu"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    Account Password
                  </Text>
                  <TextInput
                    secureTextEntry
                    placeholder="••••••••"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>
              </View>

              {/* SECURITY NOTICE */}
              <View className="bg-surface-container-low p-4 rounded-xl flex-row gap-4">
                <Text>🔒</Text>
                <Text className="text-xs text-on-surface-variant flex-1">
                  Your data is protected by campus-grade encryption. We only use
                  your ID photo for verification.
                </Text>
              </View>

              {/* BUTTON */}
              <View className="pt-4">
                <LinearGradient
                  colors={["#3F51B5", "#4551af"]}
                  className="py-5 rounded-lg items-center"
                >
                  <Text className="text-white font-bold text-base">
                    Complete Registration →
                  </Text>
                </LinearGradient>

                <Text className="text-center mt-6 text-sm text-on-surface-variant">
                  Already have an account?
                  <Text
                    className="text-primary font-bold"
                    onPress={() => navigation.navigate("Login")}
                  >
                    {" "}
                    Log in here
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
