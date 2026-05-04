import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

export default function ResourceDetailsScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
              paddingBottom: isLg ? 40 : (insets.bottom > 0 ? insets.bottom + 100 : 120),
              paddingHorizontal: isMd ? 32 : 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="max-w-[1152px] w-full mx-auto pb-4 pt-4">
              {/* Hero Section */}
              <View className="flex-col md:flex-row gap-6 items-start">
                <View className="w-full md:w-[58%] rounded-2xl overflow-hidden shadow-sm relative">
                  <Image
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5ail6tN-vNk-a8XCfpRXVwUYNuM7KYPRSoewAJ-JGSFVC--Zs7wUto1o5bZpwbQC9xlK0Yf1yZ3Uxqbe5LubRjcnska5Y-w54mli1t-wFwQ2jL_7SMuLI7ipqargW_MNbW2Bs0JqeF31FVEh8xtan8oFbY90JAbjV8yormCDMB7BKUOHEKSw-gYSRGw7vZsXymR_37khjD3rUzHeRk7Gp5ioWgz-OqMCkzMbMc2SZCNaB9R_AVamh0X2v0UXtXzPgCC8Elbr1pj_2",
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
                      4.9
                    </Text>
                  </View>
                </View>

                {/* Right Side Info */}
                <View className="w-full md:w-[40%] flex-col md:ml-[2%] pt-2">
                  <View className="mb-6">
                    <View className="self-start flex-row items-center gap-1.5 bg-secondary-fixed dark:bg-[#005048] px-3 py-1.5 rounded-full mb-4">
                      <MaterialIcons name="verified" size={14} color="#007165" className="dark:text-[#8df5e4]" />
                      <Text className="text-on-secondary-container dark:text-[#8df5e4] text-[11px] font-bold uppercase tracking-wider font-label">
                        Verified Resource
                      </Text>
                    </View>
                    <Text className="font-headline text-3xl font-bold text-primary dark:text-[#bcc2ff] leading-tight mb-2">
                      Cannondale SuperSix EVO
                    </Text>
                    <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-lg font-body">
                      Road Bike • 54cm Frame • Carbon Fiber
                    </Text>
                  </View>

                  <View className="p-6 bg-surface-container-lowest dark:bg-[#2d3133] rounded-2xl shadow-sm mb-6 border border-surface-container-low dark:border-[#3f4345]">
                    <View className="flex-row justify-between items-baseline mb-4">
                      <Text className="text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                        Daily Rate
                      </Text>
                      <View className="flex-row items-baseline gap-1 relative">
                        <Text className="text-3xl font-bold text-primary dark:text-[#bcc2ff] font-headline">
                          $15
                        </Text>
                        <Text className="text-on-surface-variant dark:text-[#c5c5d4] font-body relative top-[-4px]">
                          /day
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-4 pt-4 border-t border-outline-variant/20 dark:border-[#3f4345]">
                      <View className="flex-1 items-center">
                        <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] uppercase font-bold tracking-widest font-label mb-1">
                          Security Dep.
                        </Text>
                        <Text className="font-headline font-bold text-primary dark:text-[#bcc2ff] text-lg">
                          $100
                        </Text>
                      </View>
                      <View className="flex-1 items-center border-l border-outline-variant/20 dark:border-[#3f4345] justify-center">
                        <Text className="text-[10px] text-on-surface-variant dark:text-[#c5c5d4] uppercase font-bold tracking-widest font-label mb-1">
                          Min. Rent
                        </Text>
                        <Text className="font-headline font-bold text-primary dark:text-[#bcc2ff] text-lg">
                          2 Days
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Owner Profile Card */}
                  <View className="flex-row items-center gap-4 p-4 bg-surface-container-low dark:bg-[#3f4345] rounded-2xl">
                    <View className="w-14 h-14 rounded-xl overflow-hidden">
                      <Image
                        source={{
                          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmeo-rWMu8ongruwzN6JL3XQ9-cpvavSf2_ZJTbUnB2MrXgwwZMm3EUG45pedeT50NcrTiIc97UTUmPFx1_GyH5U-CT-BB518bjm5IbJQPKvRSG1chenv9tmFYooFySz9LnK8s6ErbrMvg-yziVME_uG3cyNfqLsPFzHn5jC8k0dSYD2EJ4SsI3OXUSfBbFuByMgRzzJWODN5y8kBtMDCHIyq5D2p1hhpzHwKmuUeZ1oDyIAV_-xchIL7VfyD9gLB0lURqRDgMKdXL",
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Text className="font-headline font-bold text-on-surface dark:text-[#f8f9fb]">
                          Alex Rivera
                        </Text>
                        <MaterialIcons name="check-circle" size={14} color="#006b5f" className="dark:text-[#8df5e4]" />
                      </View>
                      <Text className="text-xs text-on-surface-variant dark:text-[#c5c5d4] font-body">
                        Active since 2022 • 48 shares
                      </Text>
                    </View>
                    <TouchableOpacity className="p-2 bg-primary-container/10 dark:bg-primary-container/20 rounded-full active:scale-95 transition-transform">
                      <MaterialIcons name="chat-bubble" size={20} color="#2b3896" className="dark:text-[#bcc2ff]"/>
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
                      Meticulously maintained Cannondale SuperSix EVO. Perfect for
                      morning climbs through the campus hills or weekend treks.
                      Features Shimano 105 groupset and ultra-lightweight carbon
                      frame. Includes a U-lock and helmet if needed.
                    </Text>
                  </View>
                  <View className="flex-row gap-4 flex-wrap md:flex-nowrap">
                    <View className="flex-1 min-w-[45%] bg-surface-container-low dark:bg-[#2d3133] p-4 rounded-xl border border-transparent dark:border-[#3f4345]">
                      <MaterialIcons name="location-on" size={24} color="#2b3896" className="mb-2 dark:text-[#bcc2ff]" />
                      <Text className="font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-body">
                        Pickup Location
                      </Text>
                      <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-body">
                        West Campus Commons, Gate 4
                      </Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-surface-container-low dark:bg-[#2d3133] p-4 rounded-xl border border-transparent dark:border-[#3f4345]">
                      <MaterialIcons name="security" size={24} color="#2b3896" className="mb-2 dark:text-[#bcc2ff]" />
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

                    {/* Calendar Grid */}
                    <View className="mb-8">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-bold text-on-surface dark:text-[#f8f9fb] font-body">
                          October 2023
                        </Text>
                        <View className="flex-row gap-2">
                          <TouchableOpacity>
                            <MaterialIcons name="chevron-left" size={24} color="#454652" className="dark:text-[#c5c5d4]" />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <MaterialIcons name="chevron-right" size={24} color="#454652" className="dark:text-[#c5c5d4]" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Header Row */}
                      <View className="flex-row justify-between mb-2 px-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <View key={i} className="w-[12%] items-center">
                            <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-widest font-label">
                              {day}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Days Grid Simulation */}
                      <View className="flex-row flex-wrap justify-between gap-y-1">
                        {[24, 25, 26, 27, 28, 29, 30].map((num) => (
                          <View key={`empty-${num}`} className="w-[13.5%] aspect-square items-center justify-center mb-1">
                            <Text className="text-xs md:text-sm text-outline-variant/40 dark:text-[#c5c5d4]/40 font-body">{num}</Text>
                          </View>
                        ))}
                        {[1, 2].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-surface-container-low dark:bg-[#3f4345] mb-1">
                            <Text className="text-xs md:text-sm text-on-surface dark:text-[#f8f9fb] font-body">{num}</Text>
                          </View>
                        ))}
                        {[3, 4, 5].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-secondary-fixed dark:bg-[#005048] shadow-sm mb-1">
                            <Text className="text-xs md:text-sm font-bold text-on-secondary-fixed-variant dark:text-[#8df5e4] font-body">{num}</Text>
                          </View>
                        ))}
                        {[6, 7].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-error-container dark:bg-[#93000a] mb-1">
                            <Text className="text-xs md:text-sm text-on-error-container dark:text-[#ffdad6] font-body">{num}</Text>
                          </View>
                        ))}
                        {[8, 9, 10].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-secondary-fixed dark:bg-[#005048] shadow-sm mb-1">
                            <Text className="text-xs md:text-sm font-bold text-on-secondary-fixed-variant dark:text-[#8df5e4] font-body">{num}</Text>
                          </View>
                        ))}
                        {[11, 12, 13, 14].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-surface-container-low dark:bg-[#3f4345] mb-1">
                            <Text className="text-xs md:text-sm text-on-surface-variant/50 dark:text-[#c5c5d4]/50 font-body">{num}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View className="flex-row gap-4 mt-4">
                        <View className="flex-row items-center gap-1.5">
                          <View className="w-2 h-2 rounded-full bg-secondary-fixed dark:bg-[#005048]" />
                          <Text className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant dark:text-[#c5c5d4] font-label">Available</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <View className="w-2 h-2 rounded-full bg-error-container dark:bg-[#93000a]" />
                          <Text className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant dark:text-[#c5c5d4] font-label">Booked</Text>
                        </View>
                      </View>
                    </View>

                    {/* Booking Form */}
                    <View className="mb-4 flex-row justify-between gap-3 md:gap-4">
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-widest pl-1 mb-1 font-label">
                          Start Date
                        </Text>
                        <TouchableOpacity className="bg-surface-container-highest dark:bg-[#3f4345] px-3 md:px-4 py-3 rounded-xl flex-row items-center justify-between">
                          <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">Oct 3</Text>
                          <MaterialIcons name="calendar-month" size={16} color="#2b3896" className="dark:text-[#bcc2ff]" />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-widest pl-1 mb-1 font-label">
                          End Date
                        </Text>
                        <TouchableOpacity className="bg-surface-container-highest dark:bg-[#3f4345] px-3 md:px-4 py-3 rounded-xl flex-row items-center justify-between">
                          <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">Oct 5</Text>
                          <MaterialIcons name="calendar-month" size={16} color="#2b3896" className="dark:text-[#bcc2ff]"/>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="pt-2 gap-3">
                      <TouchableOpacity className="w-full rounded-xl shadow-md overflow-hidden active:scale-[0.98] transition-transform">
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
                      </TouchableOpacity>
                      <TouchableOpacity className="w-full py-4 rounded-xl border border-outline-variant/20 dark:border-[#3f4345] flex-row items-center justify-center gap-2 active:scale-[0.98] transition-transform bg-transparent">
                        <MaterialIcons name="chat" size={20} color="#2b3896" className="dark:text-[#bcc2ff]" />
                        <Text className="text-primary dark:text-[#bcc2ff] font-headline font-bold">
                          Chat with Owner
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <BottomNav />
        </View>
      </View>
    </View>
  );
}
