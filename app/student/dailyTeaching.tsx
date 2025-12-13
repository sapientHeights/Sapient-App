import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import UniversalDatePicker from "@/components/UniversalDatePicker";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type TeachingData = {
  sessionId: string;
  classId: string;
  section: string;
  subjectId: string;
  date: string;
  topicCovered: string;
  homeWork: string;
  remarks: string;
  tId: string | number;
};

const StdDailyTeaching = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedData, setSelectedData] = useState<TeachingData[]>([]);
  const [todayData, setTodayData] = useState<TeachingData[]>([]);
  const [todayIndex, setTodayIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const getDailyTeaching = async (today: boolean = true) => {
    let userDataStr: string | null = null;
    if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
    else userDataStr = await SecureStore.getItemAsync("user_data");

    if (!userDataStr) {
      Toast.show({ type: "error", text1: "Error", text2: "User not found" });
      router.replace("/login");
      return;
    }

    const userData = JSON.parse(userDataStr);
    if (!today && selectedDate.toLocaleDateString("en-CA") >= new Date().toLocaleDateString("en-CA")) {
      Toast.show({ type: "error", text1: "Error", text2: "Invalid Date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/getDailyTeaching.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: userData.session,
          classId: userData.class,
          section: userData.section,
          ...(!today && { date: selectedDate.toLocaleDateString("en-CA") }),
        }),
      });

      const data = await res.json();

      if (!data.error) {
        if (today) {
          setTodayData(data.dtData);
          setTodayIndex(0);
        } else {
          setSelectedData(data.dtData);
        }
      } else {
        Toast.show({ type: "error", text1: "No Data", text2: "Failed to fetch daily teaching" });
      }
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDailyTeaching();
  }, []);

  const nextToday = () => {
    if (todayIndex < todayData.length - 1) setTodayIndex(todayIndex + 1);
  };

  const prevToday = () => {
    if (todayIndex > 0) setTodayIndex(todayIndex - 1);
  };

  // const onDateChange = (event: any, date?: Date) => {
  //   setShowPicker(false);
  //   if (date) setSelectedDate(date);
  // };

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  };


  const fetchTeaching = () => {
    setSelectedData([]);
    getDailyTeaching(false);
  };

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );

  return (
    <StdSidebarLayout headerTitle="Daily Teaching">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Today's Teaching */}
        <Text style={styles.sectionTitle}>Today's Teaching</Text>
        {todayData.length > 0 ? (
          <View>
            <View style={styles.navRow}>
              <TouchableOpacity onPress={prevToday} disabled={todayIndex === 0}>
                <Feather name="chevron-left" size={24} color={todayIndex === 0 ? "#ccc" : "#4F46E5"} />
              </TouchableOpacity>
              <Text style={styles.navText}>{todayData[todayIndex].subjectId}</Text>
              <TouchableOpacity onPress={nextToday} disabled={todayIndex === todayData.length - 1}>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={todayIndex === todayData.length - 1 ? "#ccc" : "#4F46E5"}
                />
              </TouchableOpacity>
            </View>
            <TeachingCard data={todayData[todayIndex]} />
          </View>
        ) : (
          <Text style={styles.noData}>No teaching submitted today.</Text>
        )}

        {/* Date Selector */}
        <Text style={styles.sectionTitle}>View by Date</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
          <Feather name="calendar" size={18} color="#4F46E5" />
          <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showPicker && <UniversalDatePicker value={selectedDate} onChange={onDateChange} />}

        <TouchableOpacity style={styles.fetchBtn} onPress={fetchTeaching}>
          <Text style={styles.fetchText}>Fetch Teaching</Text>
        </TouchableOpacity>

        {selectedData.length > 0 ? (
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {selectedData.map((d, i) => (
              <TeachingCard key={i} data={d} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noData}>No daily teaching available for this date.</Text>
        )}
      </ScrollView>
    </StdSidebarLayout>
  );
};

export default StdDailyTeaching;

/* ---------------- Teaching Card ---------------- */
const TeachingCard: React.FC<{ data: TeachingData }> = ({ data }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Feather name="book" size={20} color="#4F46E5" />
      <Text style={styles.subject}>{data.subjectId}</Text>
    </View>
    <Text style={styles.label}>Topic Covered:</Text>
    <Text style={styles.value}>{data.topicCovered}</Text>
    <Text style={styles.label}>Homework:</Text>
    <Text style={styles.value}>{data.homeWork}</Text>
    <Text style={styles.label}>Remarks:</Text>
    <Text style={styles.value}>{data.remarks}</Text>
  </View>
);

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#4F46E5", marginBottom: 10, marginTop: 10 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navText: { fontSize: 16, fontWeight: "600", color: "#1E293B" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 18, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, width: 270, marginRight: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  subject: { fontSize: 16, fontWeight: "700", marginLeft: 10, color: "#1E293B" },
  label: { marginTop: 6, color: "#6B7280", fontSize: 13 },
  value: { color: "#374151", marginBottom: 4 },
  dateInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEF2FF", padding: 12, borderRadius: 10, marginBottom: 10 },
  dateText: { marginLeft: 8, color: "#1E293B", fontWeight: "500" },
  fetchBtn: { backgroundColor: "#4F46E5", padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 20, marginTop: 5 },
  fetchText: { color: "white", fontWeight: "700" },
  noData: { textAlign: "center", color: "#9CA3AF", marginTop: 30, marginBottom: 30, fontSize: 14 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
