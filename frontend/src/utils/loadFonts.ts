import * as Font from "expo-font";

export async function loadFonts() {
  await Font.loadAsync({
    PlusJakartaSans: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    Inter: require("../../assets/fonts/Inter-Regular.ttf"),
  });
}