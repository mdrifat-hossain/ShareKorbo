import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

export default function CreateListingScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

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
              paddingHorizontal: isMd ? 32 : 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="max-w-[1024px] w-full mx-auto">
              <View className="mb-12">
                <Text className="text-secondary dark:text-[#8df5e4] font-semibold tracking-wider text-xs uppercase mb-2">
                  ShareKorbo
                </Text>
                <Text className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface dark:text-[#f8f9fb] mb-4">
                  Create New Listing
                </Text>
                <Text className="text-lg text-on-surface-variant dark:text-[#c5c5d4] max-w-2xl leading-relaxed font-body">
                  Turn your unused campus resources into opportunities for others.
                  Fill in the details below to publish your item or service.
                </Text>
              </View>

              <View className="flex-col gap-12 pb-8">
                {/* 1. Media Upload Section */}
                <View className="bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                  <View className="flex-row items-center gap-4 mb-8">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <MaterialIcons name="add-a-photo" size={20} color="#2b3896" className="dark:text-[#bcc2ff]" />
                    </View>
                    <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                      Media Upload
                    </Text>
                  </View>
                  <View className="flex-col md:flex-row gap-4">
                    <View className="flex-[2] aspect-[16/9] md:aspect-auto border-2 border-dashed border-outline-variant dark:border-[#3f4345] rounded-2xl flex-col items-center justify-center bg-surface-container-lowest dark:bg-[#191c1e] p-8">
                      <MaterialIcons name="upload-file" size={40} color="#757684" className="mb-4 dark:text-[#c5c5d4]" />
                      <Text className="font-bold text-on-surface dark:text-[#f8f9fb] font-body text-center">
                        Tap here to upload item photos
                      </Text>
                      <Text className="text-sm text-outline dark:text-[#c5c5d4] mt-1 font-body text-center">
                        PNG, JPG up to 10MB each
                      </Text>
                    </View>
                    <View className="flex-[1] aspect-square bg-surface-container dark:bg-[#191c1e] rounded-2xl overflow-hidden relative">
                      <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLE6EZMF-af17UsGghiBMskPkSjHMMPK6t3WCmXqQ3G_VEzZVa2FBIYONiL6dYNnzzd5y2jpwYlrYzPCDtFljCsoPPCwZXQz2i1DQ6e31XhvkWFmASHc0DzEKsXFfoxRT5QwdmFrOZvT6gJ6lQy9h2-hJTs08OU9oIJgvAXmRiLq8mdhYZYYynI7GslN592TgVznNBMKs2vnTG_XpFog5k0l01SAEqCTOXzNyVNShZV5gFIdE5zm6zev838recr_87aoslH4KnPfMf" }}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                      />
                      <TouchableOpacity className="absolute top-2 right-2 bg-error-container dark:bg-[#93000a] p-1.5 rounded-full shadow-sm">
                        <MaterialIcons name="close" size={16} color="#93000a" className="dark:text-[#ffdad6]" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-[1] aspect-square border-2 border-dashed border-outline-variant/40 dark:border-[#3f4345] rounded-2xl flex items-center justify-center">
                      <MaterialIcons name="add" size={32} color="#757684" className="dark:text-[#c5c5d4]"/>
                    </View>
                  </View>
                </View>

                {/* 2. Basic Info & Description */}
                <View className="flex-col lg:flex-row gap-8">
                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                    <View className="flex-row items-center gap-4 mb-8">
                      <View className="w-10 h-10 rounded-xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                        <MaterialIcons name="info" size={20} color="#006b5f" className="dark:text-[#8df5e4]" />
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Basic Info
                      </Text>
                    </View>
                    <View className="flex-col gap-6">
                      <View className="flex-col gap-2">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Item Title</Text>
                        <TextInput
                          className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                          placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                          placeholder="e.g., MacBook Pro M1 2021"
                        />
                      </View>
                      <View className="flex-row gap-4">
                        <View className="flex-1 flex-col gap-2">
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Category</Text>
                          <TouchableOpacity className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 flex-row justify-between items-center">
                            <Text className="text-on-surface dark:text-[#f8f9fb] font-body">Electronics</Text>
                            <MaterialIcons name="arrow-drop-down" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#454652"} />
                          </TouchableOpacity>
                        </View>
                        <View className="flex-1 flex-col gap-2">
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Condition</Text>
                          <TouchableOpacity className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 flex-row justify-between items-center">
                            <Text className="text-on-surface dark:text-[#f8f9fb] font-body">Like New</Text>
                            <MaterialIcons name="arrow-drop-down" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#454652"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="flex-col gap-3">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Listing Type</Text>
                        <View className="flex-row flex-wrap gap-2">
                          <TouchableOpacity className="px-4 py-2 bg-primary dark:bg-[#bcc2ff] rounded-full shadow-md">
                            <Text className="text-white dark:text-[#000c62] text-sm font-semibold font-body">Borrow</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="px-4 py-2 bg-surface-container-highest dark:bg-[#3f4345] rounded-full">
                            <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-sm font-semibold font-body">Rent</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="px-4 py-2 bg-surface-container-highest dark:bg-[#3f4345] rounded-full">
                            <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-sm font-semibold font-body">Sell</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="px-4 py-2 bg-surface-container-highest dark:bg-[#3f4345] rounded-full">
                            <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-sm font-semibold font-body">Exchange</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345] flex-col">
                    <View className="flex-row items-center gap-4 mb-8">
                      <View className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/20 dark:bg-tertiary/20 flex items-center justify-center">
                        <MaterialIcons name="description" size={20} color="#5b3d00" className="dark:text-[#ffdeac]" />
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Description
                      </Text>
                    </View>
                    <View className="flex-1 min-h-[220px]">
                      <TextInput
                        className="w-full flex-1 bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-2xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                        placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                        placeholder="Describe the condition, usage, and any specific requirements for the borrower/buyer..."
                        multiline={true}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>

                {/* 3. Pricing & Terms and Availability */}
                <View className="flex-col lg:flex-row gap-8">
                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                    <View className="flex-row items-center gap-4 mb-8">
                      <View className="w-10 h-10 rounded-xl bg-secondary-fixed/30 dark:bg-[#005048] flex items-center justify-center">
                        <MaterialIcons name="payments" size={20} color="#007165" className="dark:text-[#8df5e4]"/>
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Pricing & Terms
                      </Text>
                    </View>
                    <View className="flex-col gap-6">
                      <View className="flex-row gap-4">
                        <View className="flex-1 flex-col gap-2">
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Daily Rate (৳)</Text>
                          <TextInput
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                            placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                            placeholder="0.00"
                            keyboardType="numeric"
                          />
                        </View>
                        <View className="flex-1 flex-col gap-2">
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Deposit (৳)</Text>
                          <TextInput
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                            placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                            placeholder="500.00"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                      <View className="flex-col gap-2">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Minimum Duration</Text>
                        <View className="flex-row gap-2">
                          <TextInput
                            className="w-24 bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                            placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                            defaultValue="1"
                            keyboardType="numeric"
                          />
                          <TouchableOpacity className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 flex-row justify-between items-center">
                            <Text className="text-on-surface dark:text-[#f8f9fb] font-body">Days</Text>
                            <MaterialIcons name="arrow-drop-down" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#454652"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                    <View className="flex-row items-center gap-4 mb-6">
                      <View className="w-10 h-10 rounded-xl bg-primary-container/20 dark:bg-primary/20 flex items-center justify-center">
                        <MaterialIcons name="calendar-month" size={20} color="#2b3896" className="dark:text-[#bcc2ff]" />
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Availability
                      </Text>
                    </View>
                    <View className="bg-surface-container-lowest dark:bg-[#191c1e] p-4 rounded-2xl shadow-sm border border-outline-variant/10">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-sm font-bold text-on-surface dark:text-[#f8f9fb] font-body">September 2023</Text>
                        <View className="flex-row gap-2">
                          <TouchableOpacity className="p-1 rounded bg-transparent">
                            <MaterialIcons name="chevron-left" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#454652"} />
                          </TouchableOpacity>
                          <TouchableOpacity className="p-1 rounded bg-transparent">
                            <MaterialIcons name="chevron-right" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#454652"} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Header Row */}
                      <View className="flex-row justify-between mb-2">
                        {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, i) => (
                          <View key={i} className="flex-[1] items-center text-center">
                            <Text
                              className={`text-[10px] font-bold font-label ${
                                i >= 5 ? "text-primary-container dark:text-[#bcc2ff]" : "text-outline dark:text-[#c5c5d4]"
                              }`}
                            >
                              {day}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Days Grid */}
                      <View className="flex-row flex-wrap justify-between gap-y-1">
                        {[28, 29, 30, 31].map((num) => (
                          <View key={`empty-${num}`} className="w-[13.5%] aspect-square items-center justify-center">
                            <Text className="text-sm text-outline/30 dark:text-[#c5c5d4]/30 font-body">{num}</Text>
                          </View>
                        ))}
                        {[1].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-transparent">
                            <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">{num}</Text>
                          </View>
                        ))}
                        {[2, 3, 4, 5, 6].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg bg-secondary-container dark:bg-[#005048]">
                            <Text className="text-sm font-medium text-on-secondary-container dark:text-[#8df5e4] font-body">{num}</Text>
                          </View>
                        ))}
                        {[7, 8, 9, 10].map((num) => (
                          <View key={num} className="w-[13.5%] aspect-square items-center justify-center rounded-lg">
                            <Text className="text-sm font-medium text-on-surface dark:text-[#f8f9fb] font-body">{num}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* 4. Location Section */}
                <View className="bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                  <View className="flex-row items-center gap-4 mb-8">
                    <View className="w-10 h-10 rounded-xl bg-error-container/40 dark:bg-[#93000a]/30 flex items-center justify-center">
                      <MaterialIcons name="location-on" size={20} color="#ba1a1a" className="dark:text-[#ffdad6]"/>
                    </View>
                    <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                      Location
                    </Text>
                  </View>
                  <View className="flex-col md:flex-row gap-8 items-start">
                    <View className="flex-1 flex-col gap-6 w-full">
                      <View className="flex-col gap-2 relative">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">Pickup Point</Text>
                        <View className="relative justify-center">
                          <TextInput
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl pl-12 pr-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                            placeholderTextColor={colorScheme === "dark" ? "#c5c5d4" : "#454652"}
                            placeholder="e.g., West Campus Gate 4"
                          />
                          <View className="absolute left-4">
                            <MaterialIcons name="pin-drop" size={20} color={colorScheme === "dark" ? "#c5c5d4" : "#757684"} />
                          </View>
                        </View>
                      </View>
                      <View className="p-4 bg-secondary-fixed/20 dark:bg-[#005048]/40 rounded-xl flex-row gap-3 border border-secondary/10 dark:border-[#006b5f]/20 items-center">
                        <MaterialIcons name="verified" size={20} color="#006b5f" className="dark:text-[#8df5e4]" />
                        <Text className="text-xs text-on-secondary-container dark:text-[#8df5e4] font-medium leading-relaxed font-body flex-1">
                          Your campus ID verifies this pickup location as a trusted zone.
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1 w-full rounded-2xl overflow-hidden h-48 bg-surface-container dark:bg-[#191c1e] relative">
                      <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIQoyfTZapA6UvFN9-Ak3vuhs2FKBIorZ1ALby97F0byD6EXDGaH141DgeC7_zP6VCf0mYGuesOJm7q6YTFNRV2RuEu4Chh1KhiU3kQQIZVpiGldQIPBE3uDUR_e2e2bJycszdNlMeox0PVRWfTHCPb61V9gPCCX1z6qnU6C7_VgEvnO9iLNJiDW4v6xHUUXgg6BTquo4nvMBF43NMt4ukzWvUUSU-QvG4RUfG-V0aM6lmL2ZrLAzaOoOtOjmn3VHvLsgffsypoetA" }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-primary/10 dark:bg-[#191c1e]/40" />
                      <View className="absolute bottom-4 left-4 bg-white/90 dark:bg-[#2d3133]/90 px-3 py-2 rounded-lg shadow-md flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-error dark:bg-[#ffdad6]" />
                        <Text className="text-xs font-bold text-on-surface dark:text-[#f8f9fb] font-body">Selected: West Campus</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sticky Footer Actions placeholder */}
                <View className="flex-col md:flex-row items-center justify-end gap-4 pt-8 pb-4 border-t border-outline-variant/20 dark:border-[#3f4345]">
                  <TouchableOpacity className="w-full md:w-auto px-8 py-4 items-center justify-center rounded-xl bg-transparent active:opacity-60">
                    <Text className="text-primary dark:text-[#bcc2ff] font-bold font-body">
                      Save Draft
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="w-full md:w-[200px] rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform" onPress={() => navigation.goBack()}>
                    <LinearGradient
                      colors={["#2b3896", "#4551af"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-full py-4 items-center justify-center"
                    >
                      <Text className="text-white font-headline font-bold">
                        Publish Listing
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
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
