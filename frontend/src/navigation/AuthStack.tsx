import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerificationScreen from "../screens/VerificationScreen";
import MarketplaceScreen from "../screens/MarketplaceScreen";
import ResourceDetailsScreen from "../screens/ResourceDetailsScreen";
import CreateListingScreen from "../screens/CreateListingScreen";
import ActivityScreen from "../screens/ActivityScreen";
import InboxScreen from "../screens/InboxScreen";
import UserProfileScreen from "../screens/UserProfileScreen";

export type RootStackParamList = {
  Login: undefined;

  Register: undefined;

  Verification: undefined;

  Marketplace: undefined;

  ResourceDetails: { id: string } | undefined;

  CreateListing: undefined;

  Activity: undefined;

  Inbox: {
    listing_id?: number;
    owner_id?: number;
    listing_title?: string;
  } | undefined;
  UserProfile: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

interface AuthStackProps {
  initialRouteName?: keyof RootStackParamList;
}

export default function AuthStack({ initialRouteName = "Login" }: AuthStackProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}

