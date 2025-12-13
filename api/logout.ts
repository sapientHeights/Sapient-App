import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function handleLogout() {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("academic_data");
    } else {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("user_data");
      await SecureStore.deleteItemAsync("academic_data");
    }

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
