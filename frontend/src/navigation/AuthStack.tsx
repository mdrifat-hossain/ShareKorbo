import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerificationScreen from "../screens/VerificationScreen";
import MarketplaceScreen from "../screens/MarketplaceScreen";
import ResourceDetailsScreen from "../screens/ResourceDetailsScreen";
import CreateListingScreen from "../screens/CreateListingScreen";
import ActivityScreen from "../screens/ActivityScreen";

export type RootStackParamList = {
  Login: undefined;

  Register: undefined;

  Verification: undefined;

  Marketplace: undefined;

  ResourceDetails: undefined;

  CreateListing: undefined;

  Activity: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
    </Stack.Navigator>
  );
}
