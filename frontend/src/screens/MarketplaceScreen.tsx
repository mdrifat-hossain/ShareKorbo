import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : Platform.OS === "android"
      ? "http://10.0.2.2:8000"       // Android emulator
      : "http://localhost:8000";      // iOS simulator (change to LAN IP for real device)


export default function MarketplaceScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const [isCompact, setIsCompact] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // State for fetched resources
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Resources");

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "All Resources") {
      return matchesSearch;
    }
    
    // Map activeFilter to resource.type (borrow, rent, sell, services)
    const matchesFilter = resource.type?.toLowerCase() === activeFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Fetch data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/listing/all`);
        setResources(response.data);
      } catch (error) {
        console.log("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Determine grid columns dynamically based on state and window width
  const getGridClasses = () => {
    if (isCompact) {
      if (isLg) return "flex-row flex-wrap"; // In a real setup, handle specific grid columns
      if (isMd) return "flex-row flex-wrap";
      return "flex-row flex-wrap";
    } else {
      if (isLg) return "flex-row flex-wrap";
      if (isMd) return "flex-row flex-wrap";
      return "flex-col";
    }
  };

  const getCardWidth = () => {
    if (isCompact) {
      if (isLg) return "w-[18%]";
      if (isMd) return "w-[23%]";
      return "w-[47%]"; // Compact Mobile -> 2 columns
    } else {
      if (isLg) return "w-[31%]";
      if (isMd) return "w-[47%]";
      return "w-full"; // Standard Mobile -> 1 column
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-on-background overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          <TopAppBar />

          {/* Main Body */}
          <ScrollView
            className="flex-1 w-full"
            contentContainerStyle={{
              paddingTop: insets.top > 0 ? insets.top + 80 : 96,
              paddingBottom: isLg ? 40 : (insets.bottom > 0 ? insets.bottom + 100 : 120), // Leave room for bottom nav on mobile
              paddingHorizontal: isMd ? 24 : 16,
            }}
          >
            <View className="max-w-[1600px] w-full mx-auto">
              {/* Hero Search Section */}
              <View className="mb-12">
                <Text className="font-headline text-3xl md:text-4xl font-bold text-on-surface dark:text-white mb-6 leading-tight">
                  Find exactly what you{"\n"}
                  <Text className="text-primary">need for campus life.</Text>
                </Text>
                <View className="flex-col md:flex-row gap-4 items-stretch md:items-center max-w-4xl">
                  <View className="flex-grow flex-row items-center bg-surface-container-highest dark:bg-[#2d3133] rounded-2xl px-5 relative h-14">
                    <MaterialIcons
                      name="search"
                      size={24}
                      color="#757684"
                      className="absolute left-5"
                    />
                    <TextInput
                      placeholder="Laptops, Cycles, Books, etc."
                      placeholderTextColor="#c5c5d4"
                      className="flex-1 pl-10 pr-2 h-full text-base font-body text-on-surface dark:text-white"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  {/* Grid Toggle Buttons */}
                  <View className="flex-row items-center bg-surface-container-high dark:bg-[#2d3133] p-1 rounded-2xl self-start md:self-auto">
                    <TouchableOpacity
                      onPress={() => setIsCompact(false)}
                      className={`p-2.5 rounded-xl ${
                        !isCompact ? "bg-primary shadow-sm" : "bg-transparent"
                      }`}
                    >
                      <MaterialIcons
                        name="grid-view"
                        size={20}
                        color={!isCompact ? "#ffffff" : "#454652"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsCompact(true)}
                      className={`p-2.5 rounded-xl ${
                        isCompact ? "bg-primary shadow-sm" : "bg-transparent"
                      }`}
                    >
                      <MaterialIcons
                        name="grid-on"
                        size={20}
                        color={isCompact ? "#ffffff" : "#454652"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Category Horizontal Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-10 flex-row gap-3"
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                {["All Resources", "Borrow", "Rent", "Sell", "Services"].map((filter) => (
                  <TouchableOpacity 
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    className={`px-6 py-3 rounded-full mr-3 border ${
                      activeFilter === filter 
                        ? "bg-primary border-primary shadow-sm" 
                        : "bg-surface-container-lowest dark:bg-[#2d3133] border-surface-container-low dark:border-[#191c1e]"
                    }`}
                  >
                    <Text 
                      className={`font-headline font-semibold text-sm ${
                        activeFilter === filter 
                          ? "text-white" 
                          : "text-on-surface dark:text-white"
                      }`}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Resource Grid */}
              {loading ? (
                <View className="py-20 flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#2b3896" />
                </View>
              ) : filteredResources.length === 0 ? (
                <View className="py-20 flex-1 items-center justify-center">
                  <Text className="text-on-surface-variant font-body text-lg">No listings found matching your search</Text>
                </View>
              ) : (
                <View className={`${getGridClasses()} flex-wrap gap-4 md:gap-6`}>
                  {filteredResources.map((resource) => {
                    let badgeBg = "bg-secondary-fixed";
                    let badgeTextClass = "text-on-secondary-container";
                    let badgeIcon = "payments";

                    if (resource.type === "borrow") {
                      badgeBg = "bg-primary";
                      badgeTextClass = "text-white";
                      badgeIcon = "volunteer-activism";
                    } else if (resource.type === "sell") {
                      badgeBg = "bg-tertiary-fixed-dim";
                      badgeTextClass = "text-on-tertiary-fixed-variant";
                      badgeIcon = "shopping-cart";
                    }

                    return (
                      <TouchableOpacity
                        key={resource.id}
                        activeOpacity={0.9}
                        onPress={() => (navigation.navigate as any)("ResourceDetails", { id: resource.id })}
                        className={`bg-surface-container-lowest dark:bg-[#2d3133] rounded-2xl overflow-hidden shadow-sm border border-surface-container-low dark:border-[#191c1e] flex-col ${getCardWidth()}`}
                      >
                        <View
                          className={`overflow-hidden relative w-full ${
                            isCompact ? "aspect-square" : "aspect-[4/3]"
                          }`}
                        >
                          {/* Image logic handles dynamic server path vs hardcoded image */}
                          <Image
                            source={{ uri: resource.image?.startsWith("http") ? resource.image : (resource.image ? BASE_URL + resource.image : 'https://via.placeholder.com/300') }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                          <View className="absolute top-2 left-2 md:top-4 md:left-4">
                            <View
                              className={`${badgeBg} px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex-row items-center gap-1.5`}
                              style={
                                Platform.OS === "web"
                                  ? ({ backdropFilter: "blur(12px)" } as any)
                                  : {}
                              }
                            >
                              <MaterialIcons
                                name={badgeIcon as any}
                                size={isCompact ? 12 : 14}
                                color={
                                  resource.type === "borrow"
                                    ? "#ffffff"
                                    : resource.type === "sell"
                                      ? "#604100"
                                      : "#007165"
                                }
                              />
                              <Text
                                className={`${badgeTextClass} ${
                                  isCompact ? "text-[10px]" : "text-xs"
                                } font-bold font-headline`}
                              >
                                {resource.type.charAt(0).toUpperCase() +
                                  resource.type.slice(1)}{" "}
                                - {resource.price}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="p-3 md:p-5 flex-col flex-grow">
                          <View className="flex-row justify-between items-start mb-2">
                            <Text
                              className={`font-headline font-bold text-on-surface dark:text-white flex-1 mr-2 ${
                                isCompact ? "text-sm" : "text-lg"
                              }`}
                              numberOfLines={1}
                            >
                              {resource.title}
                            </Text>
                            <View className="flex-row items-center gap-1 shrink-0">
                              <MaterialIcons
                                name="star"
                                size={isCompact ? 14 : 18}
                                color="#ffba38"
                              />
                              <Text
                                className={`${
                                  isCompact ? "text-xs" : "text-sm"
                                } font-semibold text-on-surface dark:text-white`}
                              >
                                {resource.rating}
                              </Text>
                            </View>
                          </View>

                          {/* Hide text dynamically if compact layout via native conditional rendering rather than CSS */}
                          {!isCompact && (
                            <Text
                              className="text-on-surface-variant dark:text-[#c4c7c9] text-sm mb-4 md:mb-6"
                              numberOfLines={2}
                            >
                              {resource.description}
                            </Text>
                          )}

                          <View
                            className={`mt-auto flex-row items-center justify-between border-t border-surface-container-low dark:border-[#3f4345] ${
                              isCompact ? "pt-2" : "pt-4"
                            }`}
                          >
                            <View className="flex-row items-center gap-3">
                              {resource.owner.avatar ? (
                                <Image
                                  source={{ uri: resource.owner.avatar }}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <View
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${resource.owner.avatarColor}`}
                                >
                                  <Text className="text-[10px] font-bold text-white">
                                    {resource.owner.initials}
                                  </Text>
                                </View>
                              )}
                              {/* Hide owner info if compact mode */}
                              {!isCompact && (
                                <View>
                                  <Text className="text-xs font-bold text-on-surface dark:text-white">
                                    {resource.owner.name}
                                  </Text>
                                  <View className="flex-row items-center gap-1">
                                    <View className="bg-secondary-fixed/50 px-1.5 py-0.5 rounded">
                                      <Text className="text-on-secondary-fixed-variant text-[10px] font-bold">
                                        Verified
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}
                            </View>
                            <TouchableOpacity className="bg-primary-container/10 p-2 rounded-xl">
                              <MaterialIcons
                                name="arrow-forward"
                                size={20}
                                color="#2b3896"
                                className="dark:text-[#bcc2ff]"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          <BottomNav />
        </View>
      </View>
    </View>
  );
}
