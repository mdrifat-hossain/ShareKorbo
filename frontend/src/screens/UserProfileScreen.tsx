import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import { BASE_URL } from "../utils/config";

export default function UserProfileScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>({ average_rating: null, completed_exchanges: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [userRes, statsRes, reviewsRes, postsRes] = await Promise.all([
        axios.get(`${BASE_URL}/auth/user/${userId}`),
        axios.get(`${BASE_URL}/listing/user-stats/${userId}`),
        axios.get(`${BASE_URL}/listing/reviews/user/${userId}`),
        axios.get(`${BASE_URL}/listing/user/${userId}/posts`),
      ]);

      if (userRes.data && !userRes.data.error) {
        setUserInfo(userRes.data);
      }
      if (statsRes.data && !statsRes.data.error) {
        setStats(statsRes.data);
      }
      if (reviewsRes.data && !reviewsRes.data.error) {
        setReviews(reviewsRes.data);
      }
      if (postsRes.data && !postsRes.data.error) {
        setUserPosts(postsRes.data.posts || []);
      }
    } catch (e) {
      console.log("Error fetching profile details:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        setCurrentUserId(userId);
        fetchData(userId);
      } else {
        navigation.navigate("Login");
      }
    };
    checkUser();
  }, [fetchData, navigation]);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/change-password`, {
        user_id: parseInt(currentUserId),
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (response.data.error) {
        Alert.alert("Error", response.data.error);
      } else {
        Alert.alert("Success", "Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const deletePost = async (listingId: number) => {
    if (!currentUserId) return;

    setDeletingPostId(listingId);
    try {
      const response = await axios.delete(
        `${BASE_URL}/listing/user/${currentUserId}/posts/${listingId}`
      );

      if (response.data?.error) {
        Alert.alert("Error", response.data.error);
        return;
      }

      setUserPosts((posts) => posts.filter((post) => post.id !== listingId));
      Alert.alert("Deleted", "Your post has been deleted.");
    } catch (e) {
      console.log("Error deleting post:", e);
      Alert.alert("Error", "Failed to delete post.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const confirmDeletePost = (listingId: number, title: string) => {
    Alert.alert(
      "Delete Post",
      `Delete "${title}" from marketplace? This also removes related requests and chats for this listing.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePost(listingId),
        },
      ]
    );
  };

  // Extract initial / display name
  const studentName = userInfo?.student_id || userInfo?.email?.split("@")[0] || "Student";
  const initials = studentName.substring(0, 2).toUpperCase();

  return (
    <View className="flex-1 bg-surface dark:bg-[#191c1e] overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar activeRoute="Marketplace" onNavigate={(route) => (navigation.navigate as any)(route)} />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          <TopAppBar
            onLogout={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            }
          />

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2b3896" />
            </View>
          ) : (
            <ScrollView
              className="flex-1 w-full"
              contentContainerStyle={{
                paddingTop: insets.top > 0 ? insets.top + 80 : 96,
                paddingBottom: isLg ? 40 : (insets.bottom > 0 ? insets.bottom + 100 : 120),
                paddingHorizontal: isMd ? 24 : 16,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View className="max-w-[1024px] w-full mx-auto">
                
                {/* Header Back Button */}
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="flex-row items-center gap-1 mb-6 self-start p-1 bg-surface-container-low dark:bg-[#2d3133] rounded-full px-3 py-1.5 active:scale-95"
                >
                  <MaterialIcons name="arrow-back" size={16} color={isDark ? "#c5c5d4" : "#454652"} />
                  <Text className="text-sm font-semibold text-on-surface-variant dark:text-[#c5c5d4]">Back</Text>
                </TouchableOpacity>

                {/* Main Profile Info Section */}
                <View className="flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                  
                  {/* Large Profile Initials */}
                  <View className="w-24 h-24 rounded-full bg-primary-container dark:bg-[#303c9a] flex items-center justify-center shadow-md border-2 border-white dark:border-[#2d3133] overflow-hidden">
                    <Text className="text-3xl font-extrabold text-white tracking-tight uppercase">
                      {initials}
                    </Text>
                  </View>

                  <View className="flex-col flex-1 items-center md:items-start text-center md:text-left">
                    <Text className="text-2xl md:text-3xl font-extrabold text-on-surface dark:text-[#f8f9fb] mb-1 font-headline">
                      {studentName}
                    </Text>
                    <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] mb-3 font-body">
                      {userInfo?.email}
                    </Text>
                    
                    {/* Status Badge */}
                    <View className="bg-secondary-container dark:bg-[#005048] px-4 py-1.5 rounded-full self-center md:self-start flex-row items-center gap-1.5">
                      <MaterialIcons name="verified" size={14} color={isDark ? "#8df5e4" : "#005048"} />
                      <Text className="text-on-secondary-container dark:text-[#8df5e4] text-xs font-bold uppercase tracking-wider font-label">
                        {userInfo?.verification_status} Student
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Statistics Grid */}
                <View className="flex-col md:flex-row gap-4 mb-8">
                  
                  {/* Avg Rating Card */}
                  <View className="flex-1 p-5 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm flex-row items-center gap-4">
                    <View className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
                      <MaterialIcons name="star" size={28} color="#e0a900" />
                    </View>
                    <View className="flex-col">
                      <Text className="text-2xl font-black text-on-surface dark:text-[#f8f9fb] font-headline">
                        {stats.average_rating !== null ? stats.average_rating : "N/A"}
                      </Text>
                      <Text className="text-xs font-semibold text-on-surface-variant dark:text-[#c5c5d4] font-label uppercase tracking-wider">
                        Average Rating
                      </Text>
                    </View>
                  </View>

                  {/* Exchanges Borrowed Count */}
                  <View className="flex-1 p-5 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm flex-row items-center gap-4">
                    <View className="p-3.5 rounded-2xl bg-primary-container/20 dark:bg-primary-container/30">
                      <MaterialIcons name="swap-horiz" size={28} color={isDark ? "#bcc2ff" : "#2b3896"} />
                    </View>
                    <View className="flex-col">
                      <Text className="text-2xl font-black text-on-surface dark:text-[#f8f9fb] font-headline">
                        {stats.completed_exchanges}
                      </Text>
                      <Text className="text-xs font-semibold text-on-surface-variant dark:text-[#c5c5d4] font-label uppercase tracking-wider">
                        Exchanges Complete
                      </Text>
                    </View>
                  </View>

                  {/* Marketplace Post Count */}
                  <View className="flex-1 p-5 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm flex-row items-center gap-4">
                    <View className="p-3.5 rounded-2xl bg-secondary-container/30 dark:bg-[#005048]/40">
                      <MaterialIcons name="storefront" size={28} color={isDark ? "#8df5e4" : "#005048"} />
                    </View>
                    <View className="flex-col">
                      <Text className="text-2xl font-black text-on-surface dark:text-[#f8f9fb] font-headline">
                        {userPosts.length}
                      </Text>
                      <Text className="text-xs font-semibold text-on-surface-variant dark:text-[#c5c5d4] font-label uppercase tracking-wider">
                        Marketplace Posts
                      </Text>
                    </View>
                  </View>
                </View>

                {/* User Marketplace Posts */}
                <View className="mb-8">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-on-surface dark:text-[#f8f9fb] font-headline flex-row items-center gap-2">
                      <MaterialIcons name="inventory-2" size={20} color={isDark ? "#bcc2ff" : "#2b3896"} /> My Marketplace Posts
                    </Text>
                    <Text className="text-xs font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-wider">
                      {userPosts.length} Total
                    </Text>
                  </View>

                  {userPosts.length === 0 ? (
                    <View className="p-8 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] items-center justify-center">
                      <MaterialIcons name="inventory" size={32} color={isDark ? "#555" : "#ccc"} />
                      <Text className="text-sm font-semibold text-on-surface-variant dark:text-[#c5c5d4] italic font-body mt-2">
                        No marketplace posts yet.
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-col gap-4">
                      {userPosts.map((post) => {
                        const imageUrl = post.image
                          ? post.image.startsWith("http")
                            ? post.image
                            : BASE_URL + post.image
                          : "https://via.placeholder.com/150";

                        return (
                          <View
                            key={post.id}
                            className="p-4 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm flex-col md:flex-row gap-4 md:items-center"
                          >
                            <View className="w-full md:w-28 h-40 md:h-24 rounded-2xl overflow-hidden bg-surface-container">
                              <Image
                                source={{ uri: imageUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            </View>

                            <View className="flex-1">
                              <Text className="text-base font-bold text-on-surface dark:text-[#f8f9fb] font-headline" numberOfLines={1}>
                                {post.title}
                              </Text>
                              <Text className="text-xs text-on-surface-variant dark:text-[#c5c5d4] mt-1 font-body">
                                {post.category} • {post.condition}
                              </Text>
                              <View className="flex-row flex-wrap gap-2 mt-3">
                                <View className="px-2.5 py-1 rounded-full bg-primary-container/20 dark:bg-primary-container/30">
                                  <Text className="text-[10px] font-bold uppercase text-primary dark:text-[#bcc2ff]">
                                    {post.type}
                                  </Text>
                                </View>
                                <View className="px-2.5 py-1 rounded-full bg-secondary-container/20 dark:bg-[#005048]/30">
                                  <Text className="text-[10px] font-bold text-secondary dark:text-[#8df5e4]">
                                    {post.price || "N/A"}
                                  </Text>
                                </View>
                                <View className="px-2.5 py-1 rounded-full bg-surface-container-highest dark:bg-[#3f4345]">
                                  <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4]">
                                    {post.request_count} Requests
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={() => confirmDeletePost(post.id, post.title)}
                              disabled={deletingPostId === post.id}
                              className="px-4 py-3 rounded-xl bg-error-container dark:bg-[#93000a] flex-row items-center justify-center gap-2 active:scale-95"
                            >
                              {deletingPostId === post.id ? (
                                <ActivityIndicator size="small" color={isDark ? "#ffdad6" : "#93000a"} />
                              ) : (
                                <>
                                  <MaterialIcons name="delete-outline" size={18} color={isDark ? "#ffdad6" : "#93000a"} />
                                  <Text className="text-error dark:text-[#ffdad6] font-bold text-sm">
                                    Delete
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View className="flex-col lg:flex-row gap-8">
                  
                  {/* Left Column: Received Reviews */}
                  <View className="flex-[1.5] flex-col">
                    <Text className="text-lg font-bold text-on-surface dark:text-[#f8f9fb] mb-4 font-headline flex-row items-center gap-2">
                      <MaterialIcons name="rate-review" size={20} color={isDark ? "#bcc2ff" : "#2b3896"} /> Reviews Received
                    </Text>
                    
                    {reviews.length === 0 ? (
                      <View className="p-8 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] items-center justify-center">
                        <MaterialIcons name="feedback" size={32} color={isDark ? "#555" : "#ccc"} className="mb-2" />
                        <Text className="text-sm font-semibold text-on-surface-variant dark:text-[#c5c5d4] italic font-body">
                          No reviews received yet.
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-col gap-4">
                        {reviews.map((rev) => (
                          <View
                            key={rev.review_id}
                            className="p-5 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm"
                          >
                            <View className="flex-row justify-between items-start mb-2">
                              <View className="flex-col">
                                <Text className="font-bold text-sm text-on-surface dark:text-white">
                                  {rev.reviewer_name}
                                </Text>
                                <Text className="text-xs text-on-surface-variant dark:text-[#c5c5d4] mt-0.5 font-body">
                                  Product: {rev.listing_title}
                                </Text>
                              </View>
                              
                              {/* Rating Stars */}
                              <View className="flex-row gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <MaterialIcons
                                    key={star}
                                    name="star"
                                    size={14}
                                    color={star <= rev.rating ? "#e0a900" : (isDark ? "#444" : "#e2e8f0")}
                                  />
                                ))}
                              </View>
                            </View>
                            
                            <Text className="text-sm text-on-surface dark:text-[#f8f9fb] italic font-body mt-2 leading-relaxed">
                              "{rev.message || "No comment left."}"
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Right Column: Update Password Card */}
                  <View className="flex-1 flex-col">
                    <Text className="text-lg font-bold text-on-surface dark:text-[#f8f9fb] mb-4 font-headline flex-row items-center gap-2">
                      <MaterialIcons name="lock" size={20} color={isDark ? "#bcc2ff" : "#2b3896"} /> Security Settings
                    </Text>

                    <View className="p-6 rounded-[24px] bg-surface-container-low dark:bg-[#2d3133] border border-transparent dark:border-[#3f4345] shadow-sm">
                      <Text className="text-sm font-bold text-on-surface dark:text-[#f8f9fb] mb-4 font-headline">
                        Change Password
                      </Text>

                      {/* Current Password */}
                      <View className="mb-4">
                        <Text className="text-xs font-bold text-on-surface-variant dark:text-[#c5c5d4] mb-2 font-label">
                          Current Password
                        </Text>
                        <TextInput
                          value={oldPassword}
                          onChangeText={setOldPassword}
                          secureTextEntry
                          placeholder="••••••••"
                          placeholderTextColor={isDark ? "#555" : "#ccc"}
                          className="p-3.5 rounded-xl border bg-surface-container-lowest dark:bg-[#191c1e] text-on-surface dark:text-white font-body"
                          style={{ borderColor: isDark ? "#3f4345" : "#e2e8f0" }}
                        />
                      </View>

                      {/* New Password */}
                      <View className="mb-4">
                        <Text className="text-xs font-bold text-on-surface-variant dark:text-[#c5c5d4] mb-2 font-label">
                          New Password
                        </Text>
                        <TextInput
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry
                          placeholder="••••••••"
                          placeholderTextColor={isDark ? "#555" : "#ccc"}
                          className="p-3.5 rounded-xl border bg-surface-container-lowest dark:bg-[#191c1e] text-on-surface dark:text-white font-body"
                          style={{ borderColor: isDark ? "#3f4345" : "#e2e8f0" }}
                        />
                      </View>

                      {/* Confirm New Password */}
                      <View className="mb-6">
                        <Text className="text-xs font-bold text-on-surface-variant dark:text-[#c5c5d4] mb-2 font-label">
                          Confirm New Password
                        </Text>
                        <TextInput
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry
                          placeholder="••••••••"
                          placeholderTextColor={isDark ? "#555" : "#ccc"}
                          className="p-3.5 rounded-xl border bg-surface-container-lowest dark:bg-[#191c1e] text-on-surface dark:text-white font-body"
                          style={{ borderColor: isDark ? "#3f4345" : "#e2e8f0" }}
                        />
                      </View>

                      {/* Save Button */}
                      <TouchableOpacity
                        onPress={handleUpdatePassword}
                        disabled={updatingPassword}
                        className="w-full py-4 rounded-xl items-center justify-center bg-primary dark:bg-[#bcc2ff] active:scale-95 shadow-sm"
                      >
                        {updatingPassword ? (
                          <ActivityIndicator size="small" color={isDark ? "#000c62" : "#ffffff"} />
                        ) : (
                          <Text className="text-white dark:text-[#000c62] font-bold font-label">
                            Update Password
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

              </View>
            </ScrollView>
          )}

          <BottomNav activeRoute="Marketplace" onNavigate={(route) => (navigation.navigate as any)(route)} />
        </View>
      </View>
    </View>
  );
}
