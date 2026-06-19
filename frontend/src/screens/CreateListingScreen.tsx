import React, { useState } from "react";
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthStack";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Platform } from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Alert } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// BASE_URL per platform:
//   Web browser      → localhost
//   Android emulator → 10.0.2.2 (special alias that maps to your host machine)
//   iOS simulator    → localhost (shares the Mac's network stack)
//   Physical device  → replace 192.168.x.x with your machine's actual LAN IP
//                      (run `ipconfig` on Windows or `ifconfig` on Mac to find it)
import { BASE_URL } from "../utils/config";

export default function CreateListingScreen() {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [listingType, setListingType] = useState("borrow");

  const [sellPrice, setSellPrice] = useState("");

  const [dailyRate, setDailyRate] = useState("");

  const [depositAmount, setDepositAmount] = useState("");

  const [location, setLocation] = useState("West Campus");

  const [availabilityStart, setAvailabilityStart] = useState("");

  const [availabilityEnd, setAvailabilityEnd] = useState("");

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [category, setCategory] = useState("Electronics");

  const [condition, setCondition] = useState("Like New");

  const categoryOptions = [
    "Electronics",
    "Books",
    "Furniture",
    "Lab Equipment",
    "Sports",
    "Others",
  ];

  const conditionOptions = ["Brand New", "Like New", "Good", "Used"];

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];

    updatedImages.splice(index, 1);

    setImages(updatedImages);
  };

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [showConditionDropdown, setShowConditionDropdown] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartConfirm = (date: Date) => {
    // Always store as YYYY-MM-DD so backend datetime.strptime works
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setAvailabilityStart(`${yyyy}-${mm}-${dd}`);
    setShowStartPicker(false);
  };

  const handleEndConfirm = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setAvailabilityEnd(`${yyyy}-${mm}-${dd}`);
    setShowEndPicker(false);
  };

  const handlePublishListing = async () => {
    // Debug logs always fire first — before any validation
    console.log("===== PUBLISH CLICKED =====");
    console.log("TITLE:", title);
    console.log("DESCRIPTION:", description);
    console.log("CATEGORY:", category);
    console.log("CONDITION:", condition);
    console.log("TYPE:", listingType);
    console.log("LOCATION:", location);
    console.log("IMAGES count:", images.length);
    console.log("===========================");

    try {
      const missingFields: string[] = [];
      if (!title)       missingFields.push("Item Title");
      if (!description) missingFields.push("Description");
      if (!category)    missingFields.push("Category");
      if (!condition)   missingFields.push("Condition");
      if (!location)    missingFields.push("Pickup Location");

      if (missingFields.length > 0) {
        const msg = `Please fill in: ${missingFields.join(", ")}`;
        console.warn("VALIDATION FAIL:", msg);
        Alert.alert("Missing Fields", msg);
        return;
      }

      if (images.length === 0) {
        const msg = "Please upload at least one image";
        console.warn("VALIDATION FAIL:", msg);
        Alert.alert("Missing Image", msg);
        return;

      }

      setLoading(true);

      const userId = await AsyncStorage.getItem("user_id");
      console.log("USER ID from storage:", userId);

      if (!userId) {
        Alert.alert("Session Error", "Could not find your user ID. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      formData.append("user_id", userId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("item_condition", condition);
      formData.append("listing_type", listingType);
      formData.append("sell_price", sellPrice);
      formData.append("daily_rate", dailyRate);
      formData.append("deposit_amount", depositAmount);
      formData.append("availability_start", availabilityStart);
      formData.append("availability_end", availabilityEnd);
      formData.append("location", location);

      // IMAGES
      for (const image of images) {
        const fileName = image.fileName || "listing.jpg";
        const mimeType = image.mimeType || "image/jpeg";

        if (Platform.OS === "web") {
          const imageResponse = await fetch(image.uri);
          const blob = await imageResponse.blob();
          formData.append("images", blob, fileName);
        } else {
          formData.append("images", {
            uri: image.uri,
            name: fileName,
            type: mimeType,
          } as any);
        }
      }

      console.log("Sending request to:", `${BASE_URL}/listing/create`);

      const response = await fetch(`${BASE_URL}/listing/create`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      console.log("RESPONSE:", responseData);
      if (!response.ok || responseData.error) {
        Alert.alert("Error", responseData.error || "Failed to publish listing");
        return;
      }

      setSuccessMessage("Product posted successfully");
      Alert.alert("Success", "Product posted successfully");
      setTimeout(() => {
        navigation.navigate("Marketplace");
      }, 900);
    } catch (error: any) {
      console.error("REQUEST ERROR:", {
        message: error?.message,
        baseUrl: BASE_URL,
        error,
      });

      Alert.alert(
        "Network Error",
        `Cannot connect to backend at ${BASE_URL}. Make sure backend is running with --host 0.0.0.0 and phone is on same Wi-Fi.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface dark:bg-[#191c1e] overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar
          activeRoute="CreateListing"
          onNavigate={(route) => navigation.navigate(route)}
        />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          {successMessage ? (
            <View
              className="absolute left-4 right-4 md:left-auto md:right-8 top-24 md:w-96 z-50 rounded-xl bg-secondary-container dark:bg-[#005048] px-4 py-3 flex-row items-center gap-3 shadow-lg"
              style={{ elevation: 12 }}
            >
              <MaterialIcons name="check-circle" size={22} color={colorScheme === "dark" ? "#8df5e4" : "#005048"} />
              <Text className="flex-1 text-sm font-bold text-on-secondary-container dark:text-[#8df5e4]">
                {successMessage}
              </Text>
            </View>
          ) : null}

          <TopAppBar
            onLogout={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            }
          />

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
            <View className="max-w-[1024px] w-full mx-auto">
              <View className="mb-12">
                <Text className="text-secondary dark:text-[#8df5e4] font-semibold tracking-wider text-xs uppercase mb-2">
                  ShareKorbo
                </Text>
                <Text className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface dark:text-[#f8f9fb] mb-4">
                  Create New Listing
                </Text>
                <Text className="text-lg text-on-surface-variant dark:text-[#c5c5d4] max-w-2xl leading-relaxed font-body">
                  Turn your unused campus resources into opportunities for
                  others. Fill in the details below to publish your item or
                  service.
                </Text>
              </View>

              <View className="flex-col gap-12 pb-8">
                {/* 1. Media Upload Section */}
                <View className="bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                  <View className="flex-row items-center gap-4 mb-8">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <MaterialIcons
                        name="add-a-photo"
                        size={20}
                        color="#2b3896"
                        className="dark:text-[#bcc2ff]"
                      />
                    </View>
                    <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                      Media Upload
                    </Text>
                  </View>
                  <View className="flex-col md:flex-row gap-4">
                    {/* Upload Button */}
                    <TouchableOpacity
                      onPress={pickImages}
                      className="flex-[2] aspect-[16/9] md:aspect-auto border-2 border-dashed border-outline-variant dark:border-[#3f4345] rounded-2xl flex-col items-center justify-center bg-surface-container-lowest dark:bg-[#191c1e] p-8"
                    >
                      <MaterialIcons
                        name="upload-file"
                        size={40}
                        color="#757684"
                        className="mb-4 dark:text-[#c5c5d4]"
                      />

                      <Text className="font-bold text-on-surface dark:text-[#f8f9fb] font-body text-center">
                        Tap here to upload item photos
                      </Text>

                      <Text className="text-sm text-outline dark:text-[#c5c5d4] mt-1 font-body text-center">
                        PNG, JPG up to 10MB each
                      </Text>
                    </TouchableOpacity>

                    {/* Dynamic Images */}
                    {images.map((img, index) => (
                      <View
                        key={index}
                        className="flex-[1] aspect-square bg-surface-container dark:bg-[#191c1e] rounded-2xl overflow-hidden relative"
                      >
                        <Image
                          source={{ uri: img.uri }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />

                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-error-container dark:bg-[#93000a] p-1.5 rounded-full shadow-sm"
                        >
                          <MaterialIcons
                            name="close"
                            size={16}
                            color="#93000a"
                            className="dark:text-[#ffdad6]"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Add More Button */}
                    {images.length > 0 && (
                      <TouchableOpacity
                        onPress={pickImages}
                        className="flex-[1] aspect-square border-2 border-dashed border-outline-variant/40 dark:border-[#3f4345] rounded-2xl flex items-center justify-center"
                      >
                        <MaterialIcons
                          name="add"
                          size={32}
                          color="#757684"
                          className="dark:text-[#c5c5d4]"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 2. Basic Info & Description */}
                <View className="flex-col lg:flex-row gap-8">
                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                    <View className="flex-row items-center gap-4 mb-8">
                      <View className="w-10 h-10 rounded-xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                        <MaterialIcons
                          name="info"
                          size={20}
                          color="#006b5f"
                          className="dark:text-[#8df5e4]"
                        />
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Basic Info
                      </Text>
                    </View>
                    <View className="flex-col gap-6">
                      <View className="flex-col gap-2">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Item Title
                        </Text>
                        <TextInput
                          value={title}
                          onChangeText={setTitle}
                          className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                          placeholderTextColor={
                            colorScheme === "dark" ? "#c5c5d4" : "#454652"
                          }
                          placeholder="e.g., MacBook Pro M1 2021"
                        />
                      </View>
                      <View
                        className="flex-row gap-4"
                        style={{
                          zIndex: 999,
                        }}
                      >
                        {/* CATEGORY */}
                        <View
                          className="flex-1 flex-col gap-2 relative"
                          style={{
                            zIndex: showCategoryDropdown ? 999 : 1,
                          }}
                        >
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                            Category
                          </Text>

                          <TouchableOpacity
                            onPress={() => {
                              setShowCategoryDropdown(!showCategoryDropdown);

                              setShowConditionDropdown(false);
                            }}
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 flex-row justify-between items-center"
                          >
                            <Text className="text-on-surface dark:text-[#f8f9fb] font-body">
                              {category}
                            </Text>

                            <MaterialIcons
                              name="arrow-drop-down"
                              size={20}
                              color={
                                colorScheme === "dark" ? "#c5c5d4" : "#454652"
                              }
                            />
                          </TouchableOpacity>

                          {showCategoryDropdown && (
                            <View
                              className="absolute top-[88px] left-0 right-0 z-[999] bg-surface-container-highest dark:bg-[#3f4345] rounded-xl shadow-xl"
                              style={{
                                elevation: 20,
                              }}
                            >
                              {categoryOptions.map((item) => (
                                <TouchableOpacity
                                  key={item}
                                  onPress={() => {
                                    setCategory(item);

                                    setShowCategoryDropdown(false);
                                  }}
                                  className="px-4 py-3 border-b border-outline-variant/20"
                                >
                                  <Text className="text-on-surface dark:text-[#f8f9fb] font-body">
                                    {item}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>

                        {/* CONDITION */}
                        <View
                          className="flex-1 flex-col gap-2 relative"
                          style={{
                            zIndex: showConditionDropdown ? 999 : 1,
                          }}
                        >
                          <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                            Condition
                          </Text>

                          <TouchableOpacity
                            onPress={() => {
                              setShowConditionDropdown(!showConditionDropdown);

                              setShowCategoryDropdown(false);
                            }}
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl px-4 py-3 md:py-4 flex-row justify-between items-center"
                          >
                            <Text className="text-on-surface dark:text-[#f8f9fb] font-body">
                              {condition}
                            </Text>

                            <MaterialIcons
                              name="arrow-drop-down"
                              size={20}
                              color={
                                colorScheme === "dark" ? "#c5c5d4" : "#454652"
                              }
                            />
                          </TouchableOpacity>

                          {showConditionDropdown && (
                            <View
                              className="absolute top-[88px] left-0 right-0 z-[999] bg-surface-container-highest dark:bg-[#3f4345] rounded-xl shadow-xl"
                              style={{
                                elevation: 20,
                              }}
                            >
                              {conditionOptions.map((item) => (
                                <TouchableOpacity
                                  key={item}
                                  onPress={() => {
                                    setCondition(item);

                                    setShowConditionDropdown(false);
                                  }}
                                  className="px-4 py-3 border-b border-outline-variant/20"
                                >
                                  <Text className="text-on-surface dark:text-[#f8f9fb] font-body">
                                    {item}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                      <View
                        className="flex-col gap-3"
                        style={{
                          zIndex: 1,
                        }}
                      >
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Listing Type
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                          {/* Borrow */}
                          <TouchableOpacity
                            onPress={() => setListingType("borrow")}
                            style={
                              listingType === "borrow"
                                ? {
                                    backgroundColor: colorScheme === "dark" ? "#bcc2ff" : "#2b3896",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 3,
                                  }
                                : {
                                    backgroundColor: colorScheme === "dark" ? "#3f4345" : "#e6e8ea",
                                  }
                            }
                            className="px-4 py-2 rounded-full"
                          >
                            <Text
                              className={`text-sm font-semibold font-body ${
                                listingType === "borrow"
                                  ? "text-white dark:text-[#000c62]"
                                  : "text-on-surface-variant dark:text-[#c5c5d4]"
                              }`}
                            >
                              Borrow
                            </Text>
                          </TouchableOpacity>

                          {/* Rent */}
                          <TouchableOpacity
                            onPress={() => setListingType("rent")}
                            style={
                              listingType === "rent"
                                ? {
                                    backgroundColor: colorScheme === "dark" ? "#bcc2ff" : "#2b3896",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 3,
                                  }
                                : {
                                    backgroundColor: colorScheme === "dark" ? "#3f4345" : "#e6e8ea",
                                  }
                            }
                            className="px-4 py-2 rounded-full"
                          >
                            <Text
                              className={`text-sm font-semibold font-body ${
                                listingType === "rent"
                                  ? "text-white dark:text-[#000c62]"
                                  : "text-on-surface-variant dark:text-[#c5c5d4]"
                              }`}
                            >
                              Rent
                            </Text>
                          </TouchableOpacity>

                          {/* Sell */}
                          <TouchableOpacity
                            onPress={() => setListingType("sell")}
                            style={
                              listingType === "sell"
                                ? {
                                    backgroundColor: colorScheme === "dark" ? "#bcc2ff" : "#2b3896",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 3,
                                  }
                                : {
                                    backgroundColor: colorScheme === "dark" ? "#3f4345" : "#e6e8ea",
                                  }
                            }
                            className="px-4 py-2 rounded-full"
                          >
                            <Text
                              className={`text-sm font-semibold font-body ${
                                listingType === "sell"
                                  ? "text-white dark:text-[#000c62]"
                                  : "text-on-surface-variant dark:text-[#c5c5d4]"
                              }`}
                            >
                              Sell
                            </Text>
                          </TouchableOpacity>

                          {/* Exchange */}
                          <TouchableOpacity
                            onPress={() => setListingType("exchange")}
                            style={
                              listingType === "exchange"
                                ? {
                                    backgroundColor: colorScheme === "dark" ? "#bcc2ff" : "#2b3896",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 3,
                                  }
                                : {
                                    backgroundColor: colorScheme === "dark" ? "#3f4345" : "#e6e8ea",
                                  }
                            }
                            className="px-4 py-2 rounded-full"
                          >
                            <Text
                              className={`text-sm font-semibold font-body ${
                                listingType === "exchange"
                                  ? "text-white dark:text-[#000c62]"
                                  : "text-on-surface-variant dark:text-[#c5c5d4]"
                              }`}
                            >
                              Exchange
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345] flex-col">
                    <View className="flex-row items-center gap-4 mb-8">
                      <View className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/20 dark:bg-tertiary/20 flex items-center justify-center">
                        <MaterialIcons
                          name="description"
                          size={20}
                          color="#5b3d00"
                          className="dark:text-[#ffdeac]"
                        />
                      </View>
                      <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                        Description
                      </Text>
                    </View>
                    <View className="flex-1 min-h-[220px]">
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        className="w-full flex-1 bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-2xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                        placeholderTextColor={
                          colorScheme === "dark" ? "#c5c5d4" : "#454652"
                        }
                        placeholder="Describe the condition, usage, and any specific requirements for the borrower/buyer..."
                        multiline={true}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>

                {/* 3. Pricing & Terms and Availability */}
                <View className="flex-1 bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345] flex-col">
                  <View className="flex-row items-center gap-4 mb-8">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <MaterialIcons
                        name="payments"
                        size={20}
                        color="#6750A4"
                      />
                    </View>

                    <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                      Pricing & Terms
                    </Text>
                  </View>

                  {/* SELL */}
                  {listingType === "sell" && (
                    <View className="flex-col gap-2">
                      <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                        Sell Price
                      </Text>

                      <TextInput
                        value={sellPrice}
                        onChangeText={setSellPrice}
                        keyboardType="numeric"
                        className="w-full bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                        placeholder="e.g. 25000 BDT"
                        placeholderTextColor={
                          colorScheme === "dark" ? "#c5c5d4" : "#454652"
                        }
                      />
                    </View>
                  )}

                  {/* RENT */}
                  {listingType === "rent" && (
                    <View className="flex-col gap-6">
                      {/* Daily Rate */}
                      <View className="flex-col gap-2">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Rate Per Day
                        </Text>

                        <TextInput
                          value={dailyRate}
                          onChangeText={setDailyRate}
                          keyboardType="numeric"
                          className="w-full bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                          placeholder="e.g. 500 BDT/day"
                          placeholderTextColor={
                            colorScheme === "dark" ? "#c5c5d4" : "#454652"
                          }
                        />
                      </View>

                      {/* Deposit */}
                      <View className="flex-col gap-2">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Security Deposit
                        </Text>

                        <TextInput
                          value={depositAmount}
                          onChangeText={setDepositAmount}
                          keyboardType="numeric"
                          className="w-full bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                          placeholder="e.g. 5000 BDT"
                          placeholderTextColor={
                            colorScheme === "dark" ? "#c5c5d4" : "#454652"
                          }
                        />
                      </View>

                      {/* Availability */}
                      <View className="flex-col gap-4">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Available Date Range
                        </Text>

                        <View className="flex-row gap-4">
                          {/* START DATE */}
                          {Platform.OS === "web" ? (
                            <View className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center">
                              <input
                                type="date"
                                value={availabilityStart}
                                onChange={(e) =>
                                  setAvailabilityStart(e.target.value)
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  width: "100%",
                                  color: availabilityStart
                                    ? colorScheme === "dark"
                                      ? "#f8f9fb"
                                      : "#1a1b23"
                                    : colorScheme === "dark"
                                      ? "#c5c5d4"
                                      : "#454652",
                                  fontSize: 14,
                                  fontFamily: "inherit",
                                  cursor: "pointer",
                                }}
                              />
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => setShowStartPicker(true)}
                              className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center"
                            >
                              <Text
                                className={`font-body ${
                                  availabilityStart
                                    ? "text-on-surface dark:text-[#f8f9fb]"
                                    : "text-outline dark:text-[#c5c5d4]"
                                }`}
                              >
                                {availabilityStart || "Start Date"}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* END DATE */}
                          {Platform.OS === "web" ? (
                            <View className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center">
                              <input
                                type="date"
                                value={availabilityEnd}
                                onChange={(e) =>
                                  setAvailabilityEnd(e.target.value)
                                }
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  width: "100%",
                                  color: availabilityEnd
                                    ? colorScheme === "dark"
                                      ? "#f8f9fb"
                                      : "#1a1b23"
                                    : colorScheme === "dark"
                                      ? "#c5c5d4"
                                      : "#454652",
                                  fontSize: 14,
                                  fontFamily: "inherit",
                                  cursor: "pointer",
                                }}
                              />
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => setShowEndPicker(true)}
                              className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center"
                            >
                              <Text
                                className={`font-body ${
                                  availabilityEnd
                                    ? "text-on-surface dark:text-[#f8f9fb]"
                                    : "text-outline dark:text-[#c5c5d4]"
                                }`}
                              >
                                {availabilityEnd || "End Date"}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* BORROW */}
                  {listingType === "borrow" && (
                    <View className="flex-col gap-4">
                      <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                        Available Date Range
                      </Text>
                      <View className="flex-row gap-4">
                        {/* START DATE */}
                        {Platform.OS === "web" ? (
                          <View className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center">
                            <input
                              type="date"
                              value={availabilityStart}
                              onChange={(e) =>
                                setAvailabilityStart(e.target.value)
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                width: "100%",
                                color: availabilityStart
                                  ? colorScheme === "dark"
                                    ? "#f8f9fb"
                                    : "#1a1b23"
                                  : colorScheme === "dark"
                                    ? "#c5c5d4"
                                    : "#454652",
                                fontSize: 14,
                                fontFamily: "inherit",
                                cursor: "pointer",
                              }}
                            />
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => setShowStartPicker(true)}
                            className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center"
                          >
                            <Text
                              className={`font-body ${
                                availabilityStart
                                  ? "text-on-surface dark:text-[#f8f9fb]"
                                  : "text-outline dark:text-[#c5c5d4]"
                              }`}
                            >
                              {availabilityStart || "Start Date"}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* END DATE */}
                        {Platform.OS === "web" ? (
                          <View className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center">
                            <input
                              type="date"
                              value={availabilityEnd}
                              onChange={(e) =>
                                setAvailabilityEnd(e.target.value)
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                width: "100%",
                                color: availabilityEnd
                                  ? colorScheme === "dark"
                                    ? "#f8f9fb"
                                    : "#1a1b23"
                                  : colorScheme === "dark"
                                    ? "#c5c5d4"
                                    : "#454652",
                                fontSize: 14,
                                fontFamily: "inherit",
                                cursor: "pointer",
                              }}
                            />
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => setShowEndPicker(true)}
                            className="flex-1 bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 justify-center"
                          >
                            <Text
                              className={`font-body ${
                                availabilityEnd
                                  ? "text-on-surface dark:text-[#f8f9fb]"
                                  : "text-outline dark:text-[#c5c5d4]"
                              }`}
                            >
                              {availabilityEnd || "End Date"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Shared native date pickers for rent & borrow */}
                  {Platform.OS !== "web" && (
                    <>
                      <DateTimePickerModal
                        isVisible={showStartPicker}
                        mode="date"
                        onConfirm={handleStartConfirm}
                        onCancel={() => setShowStartPicker(false)}
                      />

                      <DateTimePickerModal
                        isVisible={showEndPicker}
                        mode="date"
                        onConfirm={handleEndConfirm}
                        onCancel={() => setShowEndPicker(false)}
                      />
                    </>
                  )}

                  {/* EXCHANGE */}
                  {listingType === "exchange" && (
                    <View className="flex-col gap-2">
                      <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                        Exchange Terms
                      </Text>

                      <TextInput
                        multiline
                        className="w-full min-h-[120px] bg-surface-container-highest dark:bg-[#3f4345] rounded-xl px-4 py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                        placeholder="Describe what kind of item you want in exchange..."
                        placeholderTextColor={
                          colorScheme === "dark" ? "#c5c5d4" : "#454652"
                        }
                      />
                    </View>
                  )}
                </View>

                {/* 4. Location Section */}
                <View className="bg-surface-container-low dark:bg-[#2d3133] p-6 md:p-8 rounded-[32px] border border-surface-container-low dark:border-[#3f4345]">
                  <View className="flex-row items-center gap-4 mb-8">
                    <View className="w-10 h-10 rounded-xl bg-error-container/40 dark:bg-[#93000a]/30 flex items-center justify-center">
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#ba1a1a"
                        className="dark:text-[#ffdad6]"
                      />
                    </View>

                    <Text className="text-2xl font-headline font-bold text-on-surface dark:text-white">
                      Location
                    </Text>
                  </View>

                  <View className="flex-col md:flex-row gap-8 items-start">
                    {/* LEFT SIDE */}
                    <View className="flex-1 flex-col gap-6 w-full">
                      {/* Pickup Point */}
                      <View className="flex-col gap-2 relative">
                        <Text className="text-sm font-bold text-on-surface-variant dark:text-[#c5c5d4] px-1 font-label">
                          Pickup Point
                        </Text>

                        <View className="relative justify-center">
                          <TextInput
                            value={location}
                            onChangeText={setLocation}
                            className="w-full bg-surface-container-highest dark:bg-[#3f4345] border-0 rounded-xl pl-12 pr-4 py-3 md:py-4 text-on-surface dark:text-[#f8f9fb] font-body"
                            placeholderTextColor={
                              colorScheme === "dark" ? "#c5c5d4" : "#454652"
                            }
                            placeholder="e.g., West Campus Gate 4"
                          />

                          <View className="absolute left-4">
                            <MaterialIcons
                              name="pin-drop"
                              size={20}
                              color={
                                colorScheme === "dark" ? "#c5c5d4" : "#757684"
                              }
                            />
                          </View>
                        </View>
                      </View>

                      {/* Verified Zone Info */}
                      <View className="p-4 bg-secondary-fixed/20 dark:bg-[#005048]/40 rounded-xl flex-row gap-3 border border-secondary/10 dark:border-[#006b5f]/20 items-center">
                        <MaterialIcons
                          name="verified"
                          size={20}
                          color="#006b5f"
                          className="dark:text-[#8df5e4]"
                        />

                        <Text className="text-xs text-on-secondary-container dark:text-[#8df5e4] font-medium leading-relaxed font-body flex-1">
                          Your campus ID verifies this pickup location as a
                          trusted zone.
                        </Text>
                      </View>
                    </View>

                    {/* RIGHT SIDE */}
                    <View className="flex-1 w-full rounded-2xl overflow-hidden h-48 bg-surface-container dark:bg-[#191c1e] relative">
                      <Image
                        source={{
                          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIQoyfTZapA6UvFN9-Ak3vuhs2FKBIorZ1ALby97F0byD6EXDGaH141DgeC7_zP6VCf0mYGuesOJm7q6YTFNRV2RuEu4Chh1KhiU3kQQIZVpiGldQIPBE3uDUR_e2e2bJycszdNlMeox0PVRWfTHCPb61V9gPCCX1z6qnU6C7_VgEvnO9iLNJiDW4v6xHUUXgg6BTquo4nvMBF43NMt4ukzWvUUSU-QvG4RUfG-V0aM6lmL2ZrLAzaOoOtOjmn3VHvLsgffsypoetA",
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />

                      <View className="absolute inset-0 bg-primary/10 dark:bg-[#191c1e]/40" />

                      {/* Dynamic Selected Location */}
                      <View className="absolute bottom-4 left-4 bg-white/90 dark:bg-[#2d3133]/90 px-3 py-2 rounded-lg shadow-md flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-error dark:bg-[#ffdad6]" />

                        <Text className="text-xs font-bold text-on-surface dark:text-[#f8f9fb] font-body">
                          Selected: {location || "No Location"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sticky Footer Actions placeholder */}
                <View className="flex-col md:flex-row items-center justify-end gap-4 pt-8 pb-4 border-t border-outline-variant/20 dark:border-[#3f4345]">
                  <TouchableOpacity
                    className="w-full md:w-[200px] rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
                    onPress={handlePublishListing}
                  >
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

          <BottomNav
            activeRoute="CreateListing"
            onNavigate={(route) => navigation.navigate(route)}
          />
        </View>
      </View>
    </View>
  );
}
