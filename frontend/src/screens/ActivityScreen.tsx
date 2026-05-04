import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

export default function ActivityScreen() {
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
          <TopAppBar />

          {/* Main Content */}
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
              {/* Editorial Header Section */}
              <View className="mb-10">
                <Text className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#bcc2ff] tracking-tight mb-2 font-headline">
                  Activity Exchange
                </Text>
                <Text className="text-lg text-on-surface-variant dark:text-[#c5c5d4] max-w-xl font-body">
                  Manage your collaborative requests and track shared resources across the campus ecosystem.
                </Text>
              </View>

              {/* Dynamic Tabs */}
              <View className="flex-row p-1 bg-surface-container-low dark:bg-[#2d3133] rounded-2xl mb-8 w-fit self-start">
                <TouchableOpacity className="px-5 md:px-8 py-3 rounded-xl bg-surface-container-lowest dark:bg-[#191c1e] shadow-sm items-center justify-center">
                  <Text className="font-semibold text-sm text-primary dark:text-[#bcc2ff] font-body">
                    Requests Received
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-5 md:px-8 py-3 rounded-xl items-center justify-center">
                  <Text className="font-semibold text-sm text-on-surface-variant dark:text-[#c5c5d4] font-body">
                    Requests Sent
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-col gap-6">
                {/* Request Card 1 */}
                <View className="bg-surface-container-lowest dark:bg-[#191c1e] rounded-[24px] p-5 md:p-6 shadow-sm border border-transparent dark:border-[#3f4345]">
                  <View className="flex-col md:flex-row md:items-center justify-between gap-6">
                    <View className="flex-row items-start gap-4 md:gap-5 flex-1 pr-4">
                      <View className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                        <Image
                          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV58Le0WDWaxGAowQfykGgvrQE3P2AjNnswLA7ZbtNO9VZcq3VIKcaYy6AxJs6DMW8XIaJRbwlJFvJwOCrEfZHOszEWqxpbG63puLD8f0OSNq8cZ41Lal794kfg3-JI9F7_9_XqF8ZIqgYWU4pTR7KdfAtndg5em9U41aGrjkOGsr2MRktatkzEkRxi9aC5yyyt_ZSvdqyDyMD6vIIJBZvEYp9IK1fE5_u7sA-KU6fk_yLU-uU9kyXCoudHApfMscLPNJDqZrY2tZF" }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="flex-col flex-1">
                        <View className="flex-row flex-wrap items-center gap-2 mb-1">
                          <View className="bg-tertiary-fixed dark:bg-[#5b3d00] px-3 py-1 rounded-full">
                            <Text className="text-on-tertiary-fixed dark:text-[#ffdeac] text-[10px] font-bold tracking-widest uppercase font-label">
                              Pending Approval
                            </Text>
                          </View>
                          <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-xs font-medium font-body">• 2 hours ago</Text>
                        </View>
                        <Text className="text-lg md:text-xl font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-headline leading-tight">
                          TI-84 Plus CE Graphing Calculator
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <Image
                            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAieKPFI94AP6rnKzYT4ztpLprlEhvsLh2yDxsfP6mFdoIE6ayj1TaiV1FpxoyIFQXhuiK6tqq19nXrnI-4cPCY_9esWmrSuYoLksks3Ia3M3nVacxoGE5idYOigTsKEJo9ZALNJmVo1b7j9UceEaCx_p74CFjOXclgI7ni8Pe00rKRHb44A-U1hbcba-0hmG2UKrl_l2mINazn_E8iioWvd3GpEbcFfBUSgT5GgywaasyLlNS6pOJkMLga3KBtoH7XKDxwyzNtmaRr" }}
                            className="w-6 h-6 rounded-full"
                            resizeMode="cover"
                          />
                          <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                            Request from <Text className="text-primary dark:text-[#bcc2ff] font-bold">Sarah Jenkins</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row md:flex-col gap-2 items-center md:items-end justify-center md:justify-start">
                      <TouchableOpacity className="p-3 rounded-xl bg-surface-container-highest dark:bg-[#3f4345] active:scale-95 transition-transform items-center justify-center">
                        <MaterialIcons name="chat-bubble" size={20} color="#2b3896" className="dark:text-[#bcc2ff]" />
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 md:flex-none px-5 md:px-6 py-3 rounded-xl bg-secondary-container dark:bg-[#005048] active:scale-95 transition-transform items-center justify-center">
                        <Text className="text-on-secondary-container dark:text-[#8df5e4] font-bold text-sm font-label">Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 md:flex-none px-5 md:px-6 py-3 rounded-xl bg-surface-container-low dark:bg-[#2d3133] active:scale-95 transition-transform items-center justify-center">
                        <Text className="text-error dark:text-[#ffdad6] font-bold text-sm font-label">Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Workflow Indicator */}
                  <View className="mt-8 pt-6 border-t border-outline-variant/20 dark:border-[#3f4345]">
                    {/* Wrap in horizontal ScrollView for mobile if elements overlap */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row items-center justify-between relative min-w-[300px] w-full px-2 pt-[14px]">
                        {/* Background line */}
                        <View className="absolute top-[22px] left-8 right-8 h-[2px] bg-surface-container-high dark:bg-[#2d3133] z-0" />
                        {/* Progress line */}
                        <View className="absolute top-[22px] left-8 w-[25%] h-[2px] bg-primary dark:bg-[#bcc2ff] z-0" />

                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-primary dark:bg-[#bcc2ff] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-primary dark:text-[#bcc2ff] uppercase tracking-tight font-label">Request</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-surface-container-high dark:bg-[#3f4345] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-tight font-label">Approval</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-surface-container-high dark:bg-[#3f4345] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-tight font-label">Exchange</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-surface-container-high dark:bg-[#3f4345] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-tight font-label">Return</Text>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* Request Card 2 */}
                <View className="bg-surface-container-lowest dark:bg-[#191c1e] rounded-[24px] p-5 md:p-6 shadow-sm border border-transparent dark:border-[#3f4345]">
                  <View className="flex-col md:flex-row md:items-center justify-between gap-6">
                    <View className="flex-row items-start gap-4 md:gap-5 flex-1 pr-4">
                      <View className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                        <Image
                          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPlCIue0_vM8dg_Wolxl-NUVzBcw-X7GaPSyi-qBxJ46-H0KZ7sldAHo7zlKkYCyEsx7ZM3JkeT1sEiCt7r2OCwPMyLbyMlb6XBRquWlat2nAmLrDLVD_JmVkexfJQzsFRCbo89ar5iElxd_AX9ZGcRtigW6S0fqUpq2rhxE05tdLp9Sxq5s8Oy5aW62GX1e9n_gMRBAz7Z9wCTy9_iWC6Ioy3bEMMdQD-qs3eNgsI7aXrHgFtagtFmjvtbv_NPzh1XEgBxBBY1ZIc" }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="flex-col flex-1">
                        <View className="flex-row flex-wrap items-center gap-2 mb-1">
                          <View className="bg-secondary-fixed dark:bg-[#005048] px-3 py-1 rounded-full">
                            <Text className="text-on-secondary-fixed-variant dark:text-[#8df5e4] text-[10px] font-bold tracking-widest uppercase font-label">
                              Approved
                            </Text>
                          </View>
                          <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-xs font-medium font-body">• Pickup scheduled tomorrow</Text>
                        </View>
                        <Text className="text-lg md:text-xl font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-headline leading-tight">
                          Sony WH-1000XM4 Headphones
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <Image
                            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgEDPCtEe1H6Wi4DufhY9TNCOsBivO28rR9_pu0VtbOrGXCyLvLe0EbBil2Z0IFOGFW7S9YHhryC_bqlDdDv0IwjhNCVupk9hSgeCotbGdkO-U2oDSO1D8PJ5_KhQKTQuV0_92F6z07sf4jCcigoGmeVk1t37F9nRDaxvNUQIYdRzg4Ay4Am19uPl8mUxN_6xZ9RxKeD_F5dXP0r4O3xm7Yvw2IpuWiZaDkFsh-Idkq4SlKlxo8UhZOz-w96lLmB4l_nlJwbfVyH5i" }}
                            className="w-6 h-6 rounded-full"
                            resizeMode="cover"
                          />
                          <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                            Borrower: <Text className="text-primary dark:text-[#bcc2ff] font-bold">Marcus Thorne</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row gap-2 items-center justify-center">
                      <TouchableOpacity className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-[#bcc2ff] active:scale-95 transition-transform shadow-sm">
                        <MaterialIcons name="qr-code-2" size={18} color="#ffffff" className="dark:text-[#000c62]" />
                        <Text className="text-white dark:text-[#000c62] font-bold text-sm font-label">Verify Exchange</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="p-3 rounded-xl bg-surface-container-low dark:bg-[#3f4345] active:scale-95 transition-transform items-center justify-center">
                        <MaterialIcons name="more-vert" size={20} color="#454652" className="dark:text-[#c5c5d4]" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Workflow Indicator */}
                  <View className="mt-8 pt-6 border-t border-outline-variant/20 dark:border-[#3f4345]">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row items-center justify-between relative min-w-[300px] w-full px-2 pt-[14px]">
                        <View className="absolute top-[22px] left-8 right-8 h-[2px] bg-surface-container-high dark:bg-[#2d3133] z-0" />
                        <View className="absolute top-[22px] left-8 w-[50%] h-[2px] bg-secondary dark:bg-[#8df5e4] z-0" />

                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-secondary dark:bg-[#8df5e4] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-secondary dark:text-[#8df5e4] uppercase tracking-tight font-label">Request</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-secondary dark:bg-[#8df5e4] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-secondary dark:text-[#8df5e4] uppercase tracking-tight font-label">Approval</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-6 h-6 rounded-full bg-surface-container-lowest dark:bg-[#191c1e] border-2 border-secondary dark:border-[#8df5e4] flex items-center justify-center">
                            <View className="w-2 h-2 rounded-full bg-secondary dark:bg-[#8df5e4]" />
                          </View>
                          <Text className="text-[10px] font-bold text-secondary dark:text-[#8df5e4] uppercase tracking-tight font-label">Exchange</Text>
                        </View>
                        <View className="z-10 flex-col items-center gap-2">
                          <View className="w-4 h-4 rounded-full bg-surface-container-high dark:bg-[#3f4345] border-[4px] border-surface-container-lowest dark:border-[#191c1e]" />
                          <Text className="text-[10px] font-bold text-on-surface-variant dark:text-[#c5c5d4] uppercase tracking-tight font-label">Return</Text>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* Request Card 3 (Grayscale opacity) */}
                <View className="bg-surface-container-low/50 dark:bg-[#2d3133]/50 rounded-[24px] p-5 md:p-6 border border-outline-variant/10 dark:border-[#3f4345] opacity-75">
                  <View className="flex-col md:flex-row md:items-center justify-between gap-6">
                    <View className="flex-row items-start gap-4 md:gap-5 flex-1 pr-4">
                      <View className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                        <Image
                          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxpQXneKKyuM51VeEFNRySUT-ZAZ6-JvZVINd8DiNcsxeJojxpomwFmCBVmBx72sWhTPq8zfVbcONjqX-T6GinIEnql0QI8xpRWvGsiGtkKjw3dgsvOFR8A0_WkN5ylrqtMA3Lrwu5Oemz4D-qHD5620SJdZ1U7CCabLT-jfYA8I_Kt8tB2K_3MVPWx2ICrDQBFB07j5WgsJIR_pv86kpKQe_AUlG4gVo8Gz9CZbhmt2z0Lh0aJsqImb6e2nw2W6oEhBtE1czHyFcT" }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="flex-col flex-1">
                        <View className="flex-row flex-wrap items-center gap-2 mb-1">
                          <View className="bg-primary-fixed dark:bg-[#dfe0ff] px-3 py-1 rounded-full">
                            <Text className="text-on-primary-fixed-variant dark:text-[#303c9a] text-[10px] font-bold tracking-widest uppercase font-label">
                              Completed
                            </Text>
                          </View>
                          <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-xs font-medium font-body">• 3 days ago</Text>
                        </View>
                        <Text className="text-lg md:text-xl font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-headline leading-tight">
                          Principles of Physics (12th Ed.)
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className="flex-row items-center gap-0.5">
                            <MaterialIcons name="star" size={14} color="#ffba38" />
                            <MaterialIcons name="star" size={14} color="#ffba38" />
                            <MaterialIcons name="star" size={14} color="#ffba38" />
                            <MaterialIcons name="star" size={14} color="#ffba38" />
                            <MaterialIcons name="star" size={14} color="#ffba38" />
                          </View>
                          <Text className="text-xs text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                            Rated by David L.
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity className="w-full md:w-auto px-6 py-3 rounded-xl bg-surface-container-highest dark:bg-[#3f4345] active:scale-95 transition-transform items-center justify-center">
                      <Text className="text-on-surface-variant dark:text-[#f8f9fb] font-bold text-sm font-label">View Receipt</Text>
                    </TouchableOpacity>
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
