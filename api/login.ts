import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export default async function handleLogin(
    loginId: string,
    password: string,
    rememberMe: boolean,
    userType: string
) {
    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    if (!API_URL) {
        Toast.show({ type: "error", text1: "Connection Error" });
        console.error("Missing EXPO_PUBLIC_BACKEND_URL");
        return null;
    }

    let endpoint = `${API_URL}/`;

    if (userType === "student") {
        endpoint += "studentLogin.php";
    } else {
        endpoint += "teacherLogin.php";
    }

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId,
                pass: password,
                rememberMe,
            }),
        });

        const data = await res.json();

        if (!data.error && data.token) {
            // Save token
            if (Platform.OS === "web") {
                localStorage.setItem("auth_token", data.token);
                localStorage.setItem("user_data", JSON.stringify(data.user));
            } else {
                await SecureStore.setItemAsync("auth_token", data.token, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
                await SecureStore.setItemAsync(
                    "user_data",
                    JSON.stringify(data.user),
                    { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
                );
            }

            let expoPushToken: string | null = null;
            if (Platform.OS === "web") {
                expoPushToken = localStorage.getItem("expoPushToken");
            } else {
                expoPushToken = await SecureStore.getItemAsync("expoPushToken");
            }

            if (expoPushToken) {
                try {
                    const res = await fetch(`${API_URL}/saveExpoPushToken.php`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            token: expoPushToken,
                            userType: userType,
                            appUserId: userType === "student" ? data.user.sId : data.user.tId 
                        }),
                    });

                    const resData = await res.json();
                    if(resData.error){
                        Toast.show({ type: "error", text1: "Notifications not enabled", text2: resData.message });
                    }
                } catch (err) {
                    Toast.show({ type: "error", text1: "Some error occurred", text2: `Failed to send Expo Push Token: ${err}` });
                }
            }
            else{
                Toast.show({ type: "error", text1: "Failed to initiate notifications" });
            }

            return data.user;
        }

        return null;
    } catch (err) {
        Toast.show({ type: "error", text1: "Login Error" });
        console.error("Login error:", err);
        return null;
    }
}
