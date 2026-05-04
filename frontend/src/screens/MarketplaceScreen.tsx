import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

// Sample Data derived from the HTML
const RESOURCES = [
  {
    id: "1",
    title: "MacBook Pro M1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNGm4vrlYHnhCim-IHfrH-LAVDzmRK9lGn6efeDLUNsAl9dUVIc7-jtz_3jf3sS4-tFywRLrhpqr0Pjw1g6tVnrV5l-6HaR2eBHQ51BWrJ04ELZ4BhLvYCRwDr8QBPFu4bKOCXdqqUaWpEnLbtJHyYgykl8yvRbdgvgcxSjypqtDp_325JWfVXqrhrqu2e6m3YI9W15MY76Dv4pTihy5xnpKwDYgCgJ4cNPxxHrp6VTbDavx9FcGFXCHp0CRVzKUeEZijYoVluG8eh",
    type: "rent",
    price: "$10/day",
    rating: "4.8",
    description:
      "Perfect for high-performance coding tasks and final project renders. Battery health 98%.",
    owner: {
      name: "Alex Rivera",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCwDT6podF4TMDkrmEFTKD37aAPdmFZf9pbcP6xiRN8gHC6S7BRmbl3UqhQCkkIV67DdmoxhHS5ySTzrXYVHedco3vqWkBHhnqygQbco8SEQqS8aFQqWd_qBKNk6ph8l3Yb1xkyVhlAHa3gcjwuoyNMtzCoMhpJZpInxcypU-H2pYq9ZoG4x4TOcTTCn7TqsrIWZ3DIErZc2IEVAHPp7z0JtRWOkyguRx8c3BSLgzDd_Wa2sYFZDx_qY2VTByd3AvadmchA8lrgQZtc",
      initials: "",
      avatarColor: "",
    },
  },
  {
    id: "2",
    title: "Mountain Bike 21-Speed",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLV2Uic3_LBdeLvdENHgN7auMbpoo-McrB9SQBLAEVoekW91h2SiIZJ4Hgl18CmoKqpWgZ5mUoKGL7GS-KKizsLYO_whPiEtd2qcHjdwUkS17BBeb1MvFLnqVSFr97EUtXS-0XPkFCs2wFqMwJ7IndurPJkHYY3mBvVpenQ3FJ-epW837r_UR1IxxWXxI7IV_5yaWp8DOZbZQ7xQWfkCsJKuSIb2gOEYu3VJAwoh7hE9aCjGbqOKQzQbnQCAgXM-agAdxafbX-S63C",
    type: "borrow",
    price: "Free",
    rating: "4.9",
    description:
      "Great for quick cross-campus travel. Comes with a lock and helmet. Return within 24h.",
    owner: {
      name: "Sarah Chen",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDbMdR2plL6BtVEuoicDCSLbV8FUu35AjVzH_OReayU5GqyT5x2nmkaBOFeFfQVeAL7o0YFRyZyzn2OdgjOJ8O15bt2Q_ef9PyfyfqEDoauijqePHicUY_APJyqQTIHQeFkO626ZkALFM2E1W-mosOtyuxI9m25djoh1uJ0DTBXDop6p46mF6_fjBnwk-bslp3qibiUZ5BmlGT9fI994RMxkZ_xyahpmxxvnL5DEWrYFD3QyYNA0JlGlMxTJru3VArhY_DqtIE4DSeE",
      initials: "",
      avatarColor: "",
    },
  },
  {
    id: "3",
    title: "Organic Chemistry Pack",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKMbuZjs4TWRnS1ESvtXpGRvxDplf8QkehKr0EjMI2Dbom2aQtiNmIj7lqMwl-SMQqprVFc_UyhKX1uC1rFfVp1YwnmpkbWO2WZR_Dgpdh1otlJkAojxD9Zgmkru3memnpXFNqWlJwSO2ToKWUlZq2MHpgqZjpQGbFYWp-VkIshwfo_a42YXb_8oAOo3BdqlanI4dUinHSfaik4n6-3WEOIgBCYLb76B5FO9H0le3wObZSF4zpFnYUMCrGbR3ChM9etGAaHB3GsbbI",
    type: "sell",
    price: "$45",
    rating: "5.0",
    description:
      "Includes latest textbook and model kit. Almost new condition, no highlights inside.",
    owner: {
      name: "Marcus T.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDjybMldDHqOVoQODK3o2chlM0m2ReY6Qs48Sj9IViGryVdHwSqbGFuvZKPh6BeDhiTbPoykkS9lFYblS7qQA6y4UtiK-VdubgyqJBxGazWlHbrwqHPrzojO5gGPW9HQ6NqhFWwhxsXpxFKm_h1ZHiCEj_B3p5zwqOscCe3BgXTwknAjtREVWX3byTJeiMHG-x2MVZHFSqeD41ug2i6wUZUJxwNMmnZmKAsT-yA_ulY9gmY-B7ijNi5kQ42Y82BxzAyU3AlvPLFgO1T",
      initials: "",
      avatarColor: "",
    },
  },
  {
    id: "4",
    title: "TI-84 Plus CE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0E3M6oU4iE4w0rM6Z3G0f5F9v2A1L9K8Q7R6S5T4U3V2W1X0Y9Z8A7B6C5D4E3F2G1H0I9J8K7L6M5N4O3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C9D8E7F6G5H4I3J2K1L0M9N8O7P6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q",
    type: "rent",
    price: "$2/day",
    rating: "4.7",
    description:
      "Graphing calculator required for most calculus classes. Charger included.",
    owner: {
      name: "John Doe",
      avatar: null,
      initials: "JD",
      avatarColor: "bg-primary-container text-white",
    },
  },
  {
    id: "5",
    title: "Sony WH-1000XM4",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0E3M6oU4iE4w0rM6Z3G0f5F9v2A1L9K8Q7R6S5T4U3V2W1X0Y9Z8A7B6C5D4E3F2G1H0I9J8K7L6M5N4O3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C9D8E7F6G5H4I3J2K1L0M9N8O7P6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q",
    type: "sell",
    price: "$120",
    rating: "4.9",
    description:
      "Excellent noise cancellation for library sessions. Like new condition.",
    owner: {
      name: "Emily Chen",
      avatar: null,
      initials: "EM",
      avatarColor: "bg-secondary-container text-on-secondary-container",
    },
  },
];

export default function MarketplaceScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const [isCompact, setIsCompact] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
                <TouchableOpacity className="px-6 py-3 rounded-full bg-primary shadow-sm mr-3">
                  <Text className="text-white font-headline font-semibold text-sm">
                    All Resources
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e] mr-3">
                  <Text className="text-on-surface dark:text-white font-headline font-semibold text-sm">
                    Borrow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e] mr-3">
                  <Text className="text-on-surface dark:text-white font-headline font-semibold text-sm">
                    Rent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e] mr-3">
                  <Text className="text-on-surface dark:text-white font-headline font-semibold text-sm">
                    Sell
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-3 rounded-full bg-surface-container-lowest dark:bg-[#2d3133] border border-surface-container-low dark:border-[#191c1e] mr-3">
                  <Text className="text-on-surface dark:text-white font-headline font-semibold text-sm">
                    Services
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Resource Grid */}
              <View className={`${getGridClasses()} flex-wrap gap-4 md:gap-6`}>
                {RESOURCES.map((resource) => {
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
                      onPress={() => navigation.navigate("ResourceDetails" as never)}
                      className={`bg-surface-container-lowest dark:bg-[#2d3133] rounded-2xl overflow-hidden shadow-sm border border-surface-container-low dark:border-[#191c1e] flex-col ${getCardWidth()}`}
                    >
                      <View
                        className={`overflow-hidden relative w-full ${
                          isCompact ? "aspect-square" : "aspect-[4/3]"
                        }`}
                      >
                        <Image
                          source={{ uri: resource.image }}
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
            </View>
          </ScrollView>

          <BottomNav />
        </View>
      </View>
    </View>
  );
}
