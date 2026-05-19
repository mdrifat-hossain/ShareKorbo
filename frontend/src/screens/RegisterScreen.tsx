import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import * as ImagePicker from "expo-image-picker";
import axios from "axios";

import { Alert, Image, ActivityIndicator } from "react-native";

export default function RegisterScreen({ navigation }: any) {
  const [university, setUniversity] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [image, setImage] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    try {
      if (!university || !studentId || !email || !password || !image) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("university", university);
      formData.append("student_id", studentId);
      formData.append("email", email);
      formData.append("password", password);

      // Convert image to blob (for web support)
      const imageResponse = await fetch(image.uri);

      const blob = await imageResponse.blob();

      formData.append(
        "student_id_image",
        blob,
        image.fileName || "student-id.png",
      );

      console.log("University:", university);
      console.log("Student ID:", studentId);
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("Image:", image);

      // SEND TO BACKEND
      const registerResponse = await axios.post(
        "http://localhost:8000/auth/register",
        formData,
      );

      console.log(registerResponse.data);

      Alert.alert("Success", "Registration UI working");

      navigation.navigate("Verification");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

                <Pressable
                  onPress={pickImage}
                  className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 items-center"
                >
                  <View className="w-16 h-16 bg-primary-fixed rounded-full items-center justify-center mb-3">
                    <Text className="text-primary text-2xl">📷</Text>
                  </View>

                  {image && (
                    <Image
                      source={{ uri: image.uri }}
                      className="w-32 h-32 rounded-xl mb-4"
                    />
                  )}

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
                    value={university}
                    onChangeText={setUniversity}
                    placeholder="e.g. United International University"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    Student ID Number
                  </Text>
                  <TextInput
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="e.g. 12345678"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    University Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@university.edu"
                    className="px-5 py-4 bg-surface-container-highest rounded-lg"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm text-on-surface-variant ml-2">
                    Account Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
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
                <Pressable onPress={handleRegister}>
                  <LinearGradient
                    colors={["#3F51B5", "#4551af"]}
                    className="py-5 rounded-lg items-center"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">
                        Complete Registration →
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

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
