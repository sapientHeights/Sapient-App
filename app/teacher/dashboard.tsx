import SidebarLayout from "@/components/teacher/SidebarLayout";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type FeatherIconName = "check-square" | "type" | "activity" | "phone" | "message-circle";

type TeacherRoute =
  | "/teacher/selectAttClass"
  | "/teacher/dailyTeaching"
  | "/teacher/studentObservation"
  | "/teacher/notice";


const TeacherDashboard = () => {
  const [userData, setUserData] = useState({
    name: "",
    tId: "",
    emailId: "",
    teacherPic: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      let userDataStr: string | null = null;

      if (Platform.OS === "web") {
        userDataStr = localStorage.getItem("user_data");
      } else {
        userDataStr = await SecureStore.getItemAsync("user_data");
      }

      if (userDataStr) {
        setUserData(JSON.parse(userDataStr));
      } else {
        router.replace("/login");
      }
    };

    loadUser();
  }, []);

  const actions: {
    title: string;
    icon: FeatherIconName;
    route?: TeacherRoute;
  }[] = [
      {
        title: "Mark Attendance",
        icon: "check-square",
        route: "/teacher/selectAttClass",
      },
      {
        title: "Daily Teaching",
        icon: "type",
        route: "/teacher/dailyTeaching",
      },
      {
        title: "Students Observation",
        icon: "activity",
        route: "/teacher/studentObservation",
      },
      {
        title: "Add Notice",
        icon: "message-circle",
        route: "/teacher/notice"
      }
    ];

  return (
    <SidebarLayout headerTitle="Teacher Dashboard">
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Hello, {userData?.name}</Text>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
        </View>
        {/* <View style={styles.avatarContainer}>
          <Text style={styles.avatarText} onPress={() => router.push({pathname: '/teacher/details'})}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : "T"}
          </Text>
        </View> */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push({ pathname: "/teacher/details" })}
          activeOpacity={0.7}
        >
          {!userData?.teacherPic ? (
            <Text style={styles.avatarText}>
              {userData?.name ? userData.name.charAt(0).toUpperCase() : "T"}
            </Text>
          ) : (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/uploads/teachers/${userData.tId}/${userData.teacherPic}`,
              }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* User Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Employee ID:</Text>
          <Text style={styles.detailValue}>{userData?.tId}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{userData?.emailId}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewClassesBtn}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: "/teacher/allottedClasses" })}
        >
          <Text style={styles.viewClassesText}>Allotted Classes</Text>
          <Feather name="layers" size={18} color="#7B61FF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {actions.map((item, index) => (
          <LinearGradient
            key={index}
            colors={["#3B82F6", "#8B5CF6"]} // blue → purple gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBox}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={{ width: "100%" }}
              onPress={() =>
                item.route ? router.push(item.route) : alert("Coming Soon")
              }
            >
              {/* Icon box (glassmorphic) */}
              <View style={styles.iconContainer}>
                <Feather name={item.icon} size={28} color="#fff" />
              </View>

              {/* Title */}
              <Text style={styles.actionTitle}>{item.title}</Text>

              {/* Overlay effect */}
              <View style={styles.overlay} />
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>

      <Text style={styles.footer}>
        © 2025 Sapient Heights. All rights reserved.
      </Text>
    </SidebarLayout>
  );
};

export default TeacherDashboard;

/* -------------------------------------------------------
   Styles
------------------------------------------------------- */
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    cursor: "pointer"
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },

  /* ACTION CARDS */
  actionsContainer: {
    width: "80%",
    alignSelf: "center",
    flexDirection: "column",
    gap: 20,
  },

  actionBox: {
    padding: 22,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 5,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.10)",
    opacity: 0,
  },

  footer: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#9CA3AF",
  },

  viewClassesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  viewClassesText: {
    color: "#7B61FF",
    fontWeight: "600",
    fontSize: 14,
  },

});
