import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import StdSidebarLayout from "@/components/student/StdSidebarLayout";

const StudentDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    sId: "",
    emailId: "",
    session: "",
    class: "",
    section: "",
    studentPic: ""
  });
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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

  if (!userData) {
    router.replace("/login");
    return null;
  }

  return (
    <StdSidebarLayout headerTitle="Student Dashboard">
      {/* Top Profile Card */}
      <View style={styles.profileCard}>

        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push({ pathname: '/student/details' })}
            activeOpacity={0.7}
          >
            {(!userData || userData.studentPic === "") ? (
              <Feather name="user" size={32} color="#6366F1" />
            ) : (
              <Image
                source={{
                  uri: `${BACKEND_URL}/uploads/students/${userData.sId}/${userData.studentPic}`,
                }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>


          <View style={{ marginLeft: 14 }}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileSub}>{userData.session}</Text>
            <Text style={styles.profileSub}>{userData.sId}</Text>
          </View>
        </View>

        {/* 🔔 Notice Button */}
        <TouchableOpacity
          style={styles.noticeButton}
          onPress={() => router.push("/student/notice")}
        >
          <Feather name="bell" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
          <Feather name="square" size={22} color="#4338CA" />
          <Text style={styles.statValue}>{userData.class}</Text>
          <Text style={styles.statLabel}>Class</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FFF7ED" }]}>
          <Feather name="columns" size={22} color="#EA580C" />
          <Text style={styles.statValue}>{userData.section}</Text>
          <Text style={styles.statLabel}>Section</Text>
        </View>
      </View>

      {/* Navigation Modules */}
      <Text style={styles.sectionTitle}>Modules</Text>

      <View style={styles.moduleGrid}>
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push({ pathname: "/student/attendance" })}
        >
          <Feather name="clipboard" size={32} color="#4F46E5" />
          <Text style={styles.moduleText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push({ pathname: "/student/dailyTeaching" })}
        >
          <Feather name="book-open" size={32} color="#4F46E5" />
          <Text style={styles.moduleText}>Daily Teaching</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/student/feedback")}
        >
          <Feather name="message-circle" size={32} color="#4F46E5" />
          <Text style={styles.moduleText}>Feedbacks</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/student/schoolFeedback")}
        >
          <Feather name="help-circle" size={32} color="#4F46E5" />
          <Text style={styles.moduleText}>Feedbacks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/student/payFee")}
        >
          <Feather name="feather" size={32} color="#4F46E5" />
          <Text style={styles.moduleText}>Fee</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2025 Sapient Heights. All rights reserved.</Text>
    </StdSidebarLayout>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    cursor: "pointer"
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  profileSub: {
    color: "#64748B",
    marginTop: 2,
  },

  /* 🔔 NOTICE BUTTON */
  noticeButton: {
    backgroundColor: "#EEF2FF",
    padding: 10,
    borderRadius: 50,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    elevation: 2,
  },
  statValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#374151",
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moduleCard: {
    width: "48%",
    backgroundColor: "white",
    paddingVertical: 26,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  moduleText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#9CA3AF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  }

});
