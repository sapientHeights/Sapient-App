import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { Feather } from '@expo/vector-icons'; // Updated import
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

type FeedbackItem = {
  sessionId: string;
  classId: string;
  section: string;
  date: string;
  sId: string;
  observation: string;
  tId: string;
  teacherName: string;
};

const StdFeedback: React.FC<any> = ({ navigation }) => {
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [monthOptions, setMonthOptions] = useState<string[]>(["All"]);
  const [stdData, setStdData] = useState<{name: string, class: string, id: string}>({name: '', class: '', id: ''});

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const getFeedbacks = async () => {
    let userDataStr: string | null = null;

    if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
    else userDataStr = await SecureStore.getItemAsync("user_data");

    if (!userDataStr) {
      Toast.show({ type: "error", text1: "Error", text2: "User not found" });
      return;
    }

    const userData = JSON.parse(userDataStr);
    setStdData({
      name: userData.name,
      class: userData.class,
      id: userData.sId
    });

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/getStdObs.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: userData.session,
          classId: userData.class,
          section: userData.section,
          sId: userData.sId,
        }),
      });

      const data = await res.json();

      if (!data.error) {
        setAllFeedbacks(data.obsData);
        generateMonthOptions(data.obsData);
      } else {
        Toast.show({
          type: "error",
          text1: "No Data",
          text2: "Failed to fetch observations",
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthOptions = (feedbacks: FeedbackItem[]) => {
    const monthsSet = new Set<string>();
    feedbacks.forEach(f => {
      const d = new Date(f.date);
      const monthYear = d.toLocaleString("default", { month: "short" }) + " " + String(d.getFullYear()).slice(-2);
      monthsSet.add(monthYear);
    });

    const sortedMonths = Array.from(monthsSet).sort((a, b) => {
      const [aMonth, aYear] = a.split(" ");
      const [bMonth, bYear] = b.split(" ");
      return new Date(`${aMonth} 1, 20${aYear}`).getTime() - new Date(`${bMonth} 1, 20${bYear}`).getTime();
    });

    setMonthOptions(["All", ...sortedMonths]);
  };

  useEffect(() => {
    getFeedbacks();
  }, []);

  const toggleExpand = (key: string) => {
    setExpandedIds(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
    );
  };

  const filteredFeedbacks = allFeedbacks.filter(f => {
    if (selectedMonth === "All") return true;
    const d = new Date(f.date);
    const monthYear = d.toLocaleString("default", { month: "short" }) + " " + String(d.getFullYear()).slice(-2);
    return monthYear === selectedMonth;
  });

  const sortedFeedbacks = filteredFeedbacks.sort((a, b) =>
    sortNewest
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );

  return (
    <StdSidebarLayout headerTitle="Feedback">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Student Info */}
        <View style={styles.infoCard}>
          <Text style={styles.studentName}>{stdData.name}</Text>
          <Text style={styles.studentDetails}>{stdData.class} • {stdData.id}</Text>
          <Text style={styles.feedbackCount}>
            Total Feedbacks: {allFeedbacks.length}
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {/* Month Selector */}
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Month:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {monthOptions.map(month => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.filterButton,
                    selectedMonth === month && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedMonth === month && { color: "#fff" }
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort Selector */}
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Sort:</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setSortNewest(prev => !prev)}
            >
              <Text style={styles.filterButtonText}>
                {sortNewest ? "Newest First" : "Oldest First"}
              </Text>
              <Feather
                name="chevron-down"
                size={16}
                color="#1E293B"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback List */}
        {sortedFeedbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No feedback available.</Text>
          </View>
        ) : (
          sortedFeedbacks.map((f, index) => {
            const uniqueKey = f.tId + f.date + index;
            const isExpanded = expandedIds.includes(uniqueKey);

            return (
              <View key={uniqueKey} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackMeta}>
                    {new Date(f.date).toLocaleDateString()} • {f.teacherName}
                  </Text>
                  <TouchableOpacity onPress={() => toggleExpand(uniqueKey)}>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {isExpanded && (
                  <Text style={styles.feedbackText}>{f.observation}</Text>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.footer}>
          © 2025 Sapient Heights. All rights reserved.
        </Text>
      </ScrollView>
    </StdSidebarLayout>
  );
};

export default StdFeedback;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  studentName: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  studentDetails: { marginTop: 4, color: "#6B7280" },
  feedbackCount: { marginTop: 6, fontSize: 14, color: "#4338CA" },

  filterRow: { marginBottom: 20 },
  filterItem: { marginBottom: 12 },
  filterLabel: { fontSize: 14, color: "#475569", marginBottom: 6 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  filterButtonActive: { backgroundColor: "#4F46E5" },
  filterButtonText: { fontSize: 13, color: "#1E293B", fontWeight: "500" },

  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  feedbackMeta: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  feedbackText: { fontSize: 14, color: "#1E293B" },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 16, color: "#9CA3AF" },

  footer: { textAlign: "center", marginTop: 30, fontSize: 12, color: "#9CA3AF" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
