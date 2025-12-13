import { handleLogout } from "@/api/logout";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SIDEBAR_WIDTH = 260;

interface SidebarLayoutProps {
  headerTitle: string;
  children: React.ReactNode;
}

const StdSidebarLayout: React.FC<SidebarLayoutProps> = ({
  headerTitle,
  children,
}) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const userType = "student";

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const onLogout = async () => {
    await handleLogout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >
        <View style={styles.sidebarHeader}>
          <Feather name="user" size={40} color="#fff" />
          {/* <Text style={styles.sidebarName}>Name</Text> */}
          <Text style={styles.sidebarRole}>Student</Text>
        </View>

        <View style={styles.sidebarMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/dashboard' })}
          >
            <Feather name="home" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/attendance' })}
          >
            <Feather name="clipboard" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/dailyTeaching' })}
          >
            <Feather name="book-open" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Daily Teaching</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/payFee' })}
          >
            <Feather name="feather" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Fee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/schoolFeedback' })}
          >
            <Feather name="help-circle" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>School Feedbacks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/notice' })}
          >
            <Feather name="bell" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>View Notices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/student/details' })}
          >
            <Feather name="user" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>My Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({ pathname: "/student/resetPassword" })}
          >
            <Feather name="lock" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Reset Password</Text>
          </TouchableOpacity>

          {/* 
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(student)/pay-fee")}
          >
            <Feather name="credit-card" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Pay Fee</Text>
          </TouchableOpacity> 
          */}

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 30 }]}
            onPress={toggleSidebar}
          >
            <Feather name="arrow-left" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
            <Feather name="log-out" size={18} color="#E0E7FF" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Feather name="menu" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" >
        {children}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StdSidebarLayout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#4F46E5",
    zIndex: 10,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  sidebarHeader: { alignItems: "center", marginBottom: 30 },
  sidebarName: { color: "#fff", fontWeight: "700", marginTop: 8 },
  sidebarRole: { color: "#CBD5E1", fontSize: 12 },
  sidebarMenu: {},
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  menuText: { color: "#E0E7FF", fontSize: 15, fontWeight: "500" },
  content: { padding: 16 },
});
