import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : Platform.OS === "android"
      ? "http://10.0.2.2:8000"
      : "http://localhost:8000";

export default function ResourceDetailsScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const { id } = (route.params as any) || {};

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (id && currentUserId) {
      const checkRequest = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/listing/check-request/${id}/${currentUserId}`);
          if (response.data && response.data.has_requested) {
            setHasRequested(true);
          }
        } catch (error) {
          console.log("Error checking request status:", error);
        }
      };
      checkRequest();
    }
  }, [id, currentUserId]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${BASE_URL}/listing/${id}`);
        setResource(response.data);
      } catch (error) {
        console.log("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleSendRequest = async () => {
    try {
      const requesterId = await AsyncStorage.getItem("user_id");
      
      if (!requesterId) {
        Alert.alert("Error", "You must be logged in to send a request.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/listing/send-request`,
        {
          listing_id: resource?.id,
          owner_id: resource?.owner_id,
          requester_id: requesterId,
          start_date: resource?.availability_start,
          end_date: resource?.availability_end,
        }
      );

      if (response.data.error) {
        Alert.alert("Notice", response.data.error);
      } else {
        setHasRequested(true);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Failed to send request");
    }
  };

  const handleCancelRequest = async () => {
    try {
      if (!currentUserId) return;
      const response = await axios.delete(`${BASE_URL}/listing/cancel-request/${id}/${currentUserId}`);
      
      if (response.data.error) {
        Alert.alert("Notice", response.data.error);
      } else {
        setHasRequested(false);
        Alert.alert("Information", "Request has been cancelled and removed.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to cancel request");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem("user_id");

      setCurrentUserId(id || "");
    };

    loadUser();
  }, []);

  return (
    <View className="flex-1 bg-surface dark:bg-[#191c1e] overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          <TopAppBar onMenuPress={() => navigation.goBack()} />

          {/* Main Content */}
          <ScrollView
            className="flex-1 w-full"
            contentContainerStyle={{
              paddingTop: insets.top > 0 ? insets.top + 80 : 96,
              paddingBottom: isLg
                ? 40
                : insets.bottom > 0
                  ? insets.bottom + 100
                  : 120,
              paddingHorizontal: isMd ? 32 : 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="py-20 flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2b3896" />
              </View>
            ) : !resource || resource.error ? (
              <View className="py-20 flex-1 items-center justify-center">
                <Text className="text-on-surface-variant font-body text-lg">
                  Resource not found
                </Text>
              </View>
            ) : (
              <View className="max-w-[1152px] w-full mx-auto pb-4 pt-4">
                {/* Hero Section */}
                <View className="flex-col md:flex-row gap-6 items-start">
                  <View className="w-full md:w-[58%] rounded-2xl overflow-hidden shadow-sm relative">
                    <Image
                      source={{
                        uri: resource.image?.startsWith("http")
                          ? resource.image
                          : resource.image
                            ? BASE_URL + resource.image
                            : "https://via.placeholder.com/600x400",
                      }}
                      className="w-full aspect-[4/3]"
                      resizeMode="cover"
                    />
                    <View
                      className="absolute top-4 right-4 bg-surface-bright/90 dark:bg-[#191c1e]/90 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-sm"
                      style={
                        Platform.OS === "web"
                          ? ({ backdropFilter: "blur(16px)" } as any)
                          : {}
                      }
                    >
                      <MaterialIcons name="star" size={16} color="#ffba38" />
                      <Text className="font-headline font-bold text-primary dark:text-[#bcc2ff]">
                        {resource.rating}
                      </Text>
                    </View>
                  </View>

                  {/* Right Side Info */}
                  <View className="w-full md:w-[40%] flex-col md:ml-[2%] pt-2">
                    <View className="mb-6">
                      <View className="self-start flex-row items-center gap-1.5 bg-secondary-fixed dark:bg-[#005048] px-3 py-1.5 rounded-full mb-4">
                        <MaterialIcons
                          name="verified"
                          size={14}
                          color="#007165"
                          className="dark:text-[#8df5e4]"
                        />
                        <Text className="text-on-secondary-container dark:text-[#8df5e4] text-[11px] font-bold uppercase tracking-wider font-label">
                          Verified Resource
                        </Text>
                      </View>
                      <Text className="font-headline text-3xl font-bold text-primary dark:text-[#bcc2ff] leading-tight mb-2">
                        {resource.title}
                      </Text>
                      <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-lg font-body">
                        {resource.category} • {resource.condition}
                      </Text>
                    </View>

                    <View className="p-6 bg-surface-container-lowest dark:bg-[#2d3133] rounded-2xl shadow-sm mb-6 border border-surface-container-low dark:border-[#3f4345]">
                      <View className="flex-row justify-between items-baseline mb-4">
                        <Text className="text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                          {resource.rate_type}
                        </Text>
                        <View className="flex-row items-baseline gap-1 relative">
                          <Text className="text-3xl font-bold text-primary dark:text-[#bcc2ff] font-headline">
                            {resource.price?.replace("/day", "")}
                          </Text>
                          {resource.price?.includes("/day") && (
                            <Text className="text-on-surface-variant dark:text-[#c5c5d4] font-body relative top-[-4px]">
                              /day
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="flex-row gap-4 pt-4 border-t border-outline-variant/20 dark:border-[#3f4345]">
                        <View className="flex-1 items-center">
                          <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] uppercase font-bold tracking-widest font-label mb-1">
                            Security Dep.
                          </Text>
                          <Text className="font-headline font-bold text-primary dark:text-[#bcc2ff] text-lg">
                            {resource.security_dep}
                          </Text>
                        </View>
                        <View className="flex-1 items-center border-l border-outline-variant/20 dark:border-[#3f4345] justify-center">
                          <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] uppercase font-bold tracking-widest font-label mb-1">
                            Min. Rent
                          </Text>
                          <Text className="font-headline font-bold text-primary dark:text-[#bcc2ff] text-lg">
                            None
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Owner Profile Card */}
                    <View className="flex-row items-center gap-4 p-4 bg-surface-container-low dark:bg-[#3f4345] rounded-2xl">
                      <View className="w-14 h-14 rounded-xl overflow-hidden">
                        {resource.owner?.avatar ? (
                          <Image
                            source={{ uri: resource.owner.avatar }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            className={`w-full h-full flex items-center justify-center ${resource.owner?.avatarColor || "bg-primary-container text-white"}`}
                          >
                            <Text className="text-lg font-bold text-white">
                              {resource.owner?.initials}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1 mb-1">
                          <Text className="font-headline font-bold text-on-surface dark:text-[#f8f9fb]">
                            {resource.owner?.name}
                          </Text>
                          <MaterialIcons
                            name="check-circle"
                            size={14}
                            color="#006b5f"
                            className="dark:text-[#8df5e4]"
                          />
                        </View>
                        <Text className="text-xs text-on-surface-variant dark:text-[#c5c5d4] font-body">
                          Active member
                        </Text>
                      </View>
                      <TouchableOpacity className="p-2 bg-primary-container/10 dark:bg-primary-container/20 rounded-full active:scale-95 transition-transform">
                        <MaterialIcons
                          name="chat-bubble"
                          size={20}
                          color="#2b3896"
                          className="dark:text-[#bcc2ff]"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Description & Details and Booking sidebar */}
                <View className="flex-col md:flex-row gap-8 pt-10">
                  {/* Description Column */}
                  <View className="w-full md:w-[58%]">
                    <View className="mb-8">
                      <Text className="font-headline text-xl font-bold text-primary dark:text-[#bcc2ff] mb-4">
                        Description
                      </Text>
                      <Text className="text-on-surface-variant dark:text-[#c5c5d4] leading-relaxed text-base md:text-lg font-body">
                        {resource.description}
                      </Text>
                    </View>
                    <View className="flex-row gap-4 flex-wrap md:flex-nowrap">
                      <View className="flex-1 min-w-[45%] bg-surface-container-low dark:bg-[#2d3133] p-4 rounded-xl border border-transparent dark:border-[#3f4345]">
                        <MaterialIcons
                          name="location-on"
                          size={24}
                          color="#2b3896"
                          className="mb-2 dark:text-[#bcc2ff]"
                        />
                        <Text className="font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-body">
                          Pickup Location
                        </Text>
                        <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-body">
                          {resource.location}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[45%] bg-surface-container-low dark:bg-[#2d3133] p-4 rounded-xl border border-transparent dark:border-[#3f4345]">
                        <MaterialIcons
                          name="security"
                          size={24}
                          color="#2b3896"
                          className="mb-2 dark:text-[#bcc2ff]"
                        />
                        <Text className="font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-body">
                          Insurance Incl.
                        </Text>
                        <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-body">
                          The Commons Basic Protection
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Booking Sidebar */}
                  <View className="w-full md:w-[40%] md:ml-[2%]">
                    <View className="bg-surface-container-lowest dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm border border-surface-container-low dark:border-[#3f4345]">
                      <Text className="font-headline text-xl font-bold text-primary dark:text-[#bcc2ff] mb-6">
                        Availability
                      </Text>

                      {/* STATUS */}
                      <View className="mb-8">
                        <View className="flex-row gap-4 mt-4">
                          {/* AVAILABLE */}
                          <View className="flex-row items-center gap-1.5">
                            <View
                              className={`w-2 h-2 rounded-full ${
                                resource?.availability_status === "Available"
                                  ? "bg-secondary-fixed dark:bg-[#005048]"
                                  : "bg-outline dark:bg-[#5f6368]"
                              }`}
                            />

                            <Text className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant dark:text-[#c5c5d4] font-label">
                              Available
                            </Text>
                          </View>

                          {/* BOOKED */}
                          <View className="flex-row items-center gap-1.5">
                            <View
                              className={`w-2 h-2 rounded-full ${
                                resource?.availability_status === "Booked"
                                  ? "bg-error-container dark:bg-[#93000a]"
                                  : "bg-outline dark:bg-[#5f6368]"
                              }`}
                            />

                            <Text className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant dark:text-[#c5c5d4] font-label">
                              Booked
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* DATE INFO */}
                      <View className="mb-4 flex-row justify-between gap-3 md:gap-4">
                        {/* START DATE */}
                        <View className="flex-1">
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-widest pl-1 mb-1 font-label">
                            Start Date
                          </Text>

                          <View className="bg-surface-container-highest dark:bg-[#3f4345] px-3 md:px-4 py-3 rounded-xl flex-row items-center justify-between">
                            <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">
                              {resource?.availability_start || "N/A"}
                            </Text>

                            <MaterialIcons
                              name="calendar-month"
                              size={16}
                              color="#2b3896"
                              className="dark:text-[#bcc2ff]"
                            />
                          </View>
                        </View>

                        {/* END DATE */}
                        <View className="flex-1">
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-widest pl-1 mb-1 font-label">
                            End Date
                          </Text>

                          <View className="bg-surface-container-highest dark:bg-[#3f4345] px-3 md:px-4 py-3 rounded-xl flex-row items-center justify-between">
                            <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">
                              {resource?.availability_end || "N/A"}
                            </Text>

                            <MaterialIcons
                              name="calendar-month"
                              size={16}
                              color="#2b3896"
                              className="dark:text-[#bcc2ff]"
                            />
                          </View>
                        </View>
                      </View>

                      {/* BUTTONS */}
                      <View className="pt-2 gap-3">
                        {currentUserId !== String(resource?.owner_id) && (
                          <TouchableOpacity 
                            onPress={hasRequested ? handleCancelRequest : handleSendRequest}
                            className={`w-full rounded-xl shadow-md overflow-hidden active:scale-[0.98] transition-transform ${
                              hasRequested ? "border border-error dark:border-[#93000a]" : ""
                            }`}
                          >
                            {hasRequested ? (
                              <View className="w-full py-4 items-center justify-center bg-error-container/10 dark:bg-[#93000a]/20">
                                <Text className="text-error dark:text-[#ffb4ab] font-headline font-bold">
                                  Cancel Request
                                </Text>
                              </View>
                            ) : (
                              <LinearGradient
                                colors={["#2b3896", "#4551af"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="w-full py-4 items-center justify-center shadow-lg"
                              >
                                <Text className="text-white font-headline font-bold">
                                  Send Request
                                </Text>
                              </LinearGradient>
                            )}
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity className="w-full py-4 rounded-xl border border-outline-variant/20 dark:border-[#3f4345] flex-row items-center justify-center gap-2 active:scale-[0.98] transition-transform bg-transparent">
                          <MaterialIcons
                            name="chat"
                            size={20}
                            color="#2b3896"
                            className="dark:text-[#bcc2ff]"
                          />
                          <Text className="text-primary dark:text-[#bcc2ff] font-headline font-bold">
                            Chat with Owner
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Custom Success Modal */}
          <Modal
            transparent={true}
            visible={showSuccessModal}
            animationType="fade"
            onRequestClose={() => setShowSuccessModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
              <View className="bg-surface dark:bg-[#2d3133] w-full max-w-sm rounded-3xl p-8 items-center shadow-lg">
                <View className="w-20 h-20 bg-[#e6f4ea] dark:bg-[#005048]/30 rounded-full items-center justify-center mb-6">
                  <MaterialIcons name="check-circle" size={48} color="#006b5f" className="dark:text-[#8df5e4]" />
                </View>
                <Text className="text-2xl font-bold font-headline text-on-surface dark:text-white mb-2 text-center">
                  Request Sended!
                </Text>
                <Text className="text-sm font-body text-on-surface-variant dark:text-[#c5c5d4] mb-8 text-center leading-relaxed">
                  Your request has been successfully sent to the owner. They will review it shortly.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowSuccessModal(false)}
                  className="w-full bg-primary py-4 rounded-xl active:scale-95 transition-transform"
                >
                  <Text className="text-white text-center font-bold font-headline text-base">
                    Great, thanks!
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <BottomNav />
        </View>
      </View>
    </View>
  );
}
