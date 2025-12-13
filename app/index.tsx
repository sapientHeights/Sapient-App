import type { ExternalPathString, RelativePathString } from 'expo-router';
import { Redirect } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

interface JwtPayload {
  exp: number;
  tId?: string;
  sId?: string;
  emailId: string;
}

export default function Index() {
  const [redirectTo, setRedirectTo] =
    useState<RelativePathString | ExternalPathString | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        let token: string | null = null;
        let userDataStr: string | null = null;

        if (Platform.OS === "web") {
          token = localStorage.getItem("auth_token");
          userDataStr = localStorage.getItem("user_data");
        } else {
          token = await SecureStore.getItemAsync("auth_token");
          userDataStr = await SecureStore.getItemAsync("user_data");
        }

        if (!token || !userDataStr) {
          setRedirectTo("/login" as RelativePathString);
          return;
        }

        const payload: JwtPayload = jwtDecode(token);

        // Check expiration
        if (Date.now() / 1000 > payload.exp) {
          if (Platform.OS === "web") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
          } else {
            await SecureStore.deleteItemAsync("auth_token");
            await SecureStore.deleteItemAsync("user_data");
          }
          setRedirectTo("/login" as RelativePathString);
          return;
        }

        const userData = JSON.parse(userDataStr);

        if (userData.sId) setRedirectTo("/student/dashboard" as RelativePathString);
        else if (userData.tId) setRedirectTo("/teacher/dashboard" as RelativePathString);
        else setRedirectTo("/login" as RelativePathString);
      } catch (err) {
        console.error("Error checking login:", err);
        setRedirectTo("/login" as RelativePathString);
      }
    };

    checkLogin();
  }, []);

  if (redirectTo === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={redirectTo} />;
}
