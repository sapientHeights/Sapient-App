import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { Feather } from '@expo/vector-icons';
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

type AttendanceStatus = "P" | "A" | "L";

interface CalendarDay {
    key: string;
    date: number | null;
    status: AttendanceStatus | null;
}

type AttData = {
    sId: string;
    studentName: string;
    sessionId: string;
    classId: string;
    section: string;
    classDate: string;
    att: AttendanceStatus;
    markedBy: string;
};

const StdAttendance: React.FC<{ navigation: any }> = ({ navigation }) => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [loading, setLoading] = useState(false);
    const [attData, setAttData] = useState<AttData[]>([]);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const getAttData = async () => {
        let userDataStr: string | null = null;

        if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
        else userDataStr = await SecureStore.getItemAsync("user_data");

        if (!userDataStr) {
            Toast.show({ type: "error", text1: "Error", text2: "User not found" });
            return;
        }

        const userData = JSON.parse(userDataStr);

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/getAttDataBySessStd.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: userData.session,
                    sId: userData.sId,
                }),
            });

            const data = await res.json();
            if (!data.error) {
                setAttData(data.attData);
            } else {
                Toast.show({ type: "error", text1: "No Data", text2: "Failed to fetch attendance" });
            }
        } catch (err) {
            console.log(err);
            Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAttData();
    }, []);

    const attMap = useMemo(() => {
        const map: Record<string, AttendanceStatus> = {};
        attData.forEach(item => { map[item.classDate] = item.att; });
        return map;
    }, [attData]);

    /* ---------- Overall Stats ---------- */
    const present = attData.filter(d => d.att === "P").length;
    const absent = attData.filter(d => d.att === "A").length;
    const leave = attData.filter(d => d.att === "L").length;
    const total = present + absent + leave;
    const attendancePercent = total === 0 ? "0%" : `${((present / total) * 100).toFixed(2)}%`;

    /* ---------- Month-Specific Stats ---------- */
    const monthStats = useMemo(() => {
        const stats = { present: 0, absent: 0, leave: 0, total: 0 };

        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

        attData.forEach(item => {
            if (item.classDate.startsWith(prefix)) {
                if (item.att === "P") stats.present++;
                else if (item.att === "A") stats.absent++;
                else if (item.att === "L") stats.leave++;
                stats.total++;
            }
        });

        return {
            ...stats,
            percent: stats.total === 0 ? "0%" : `${((stats.present / stats.total) * 100).toFixed(2)}%`,
        };
    }, [attData, month, year]);

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

    /* ---------------- Calendar Generator ---------------- */
    const generateCalendar = (): CalendarDay[] => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayIndex = new Date(year, month, 1).getDay();

        const calendar: CalendarDay[] = [];

        for (let i = 0; i < firstDayIndex; i++) {
            calendar.push({ key: `empty-${i}`, date: null, status: null });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const fullDate = new Date(year, month, d);
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

            const isSunday = fullDate.getDay() === 0;

            calendar.push({
                key,
                date: d,
                status: attMap[key] || (isSunday ? "L" : null),
            });
        }

        return calendar;
    };

    const calendar = generateCalendar();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const changeMonth = (direction: "prev" | "next") => {
        let newMonth = month + (direction === "next" ? 1 : -1);
        let newYear = year;
        if (newMonth < 0) { newMonth = 11; newYear--; }
        else if (newMonth > 11) { newMonth = 0; newYear++; }
        setMonth(newMonth);
        setYear(newYear);
    };

    if (loading)
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );

    return (
        <StdSidebarLayout headerTitle="Attendance">
            <ScrollView contentContainerStyle={styles.container}>

                {/* Overall Summary Cards */}
                <View style={styles.summaryContainer}>
                    <SummaryCard label="Attendance" value={attendancePercent} color="#4CAF50" icon="check-circle" />
                    <SummaryCard label="Present" value={String(present)} color="#10B981" icon="user-check" />
                    <SummaryCard label="Absent" value={String(absent)} color="#EF4444" icon="user-x" />
                    <SummaryCard label="Leave" value={String(leave)} color="#F59E0B" icon="clock" />
                    <SummaryCard label="Total Classes" value={String(total)} color="#4F46E5" icon="calendar" />
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth("prev")}>
                        <Feather name="chevron-left" size={24} color="#4F46E5" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
                    <TouchableOpacity onPress={() => changeMonth("next")}>
                        <Feather name="chevron-right" size={24} color="#4F46E5" />
                    </TouchableOpacity>
                </View>

                {/* Month-wise Summary - Single Line Horizontal Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <SummaryCard compact label="Total" value={String(monthStats.total)} color="#4F46E5" icon="calendar" />
                    <SummaryCard compact label="P" value={String(monthStats.present)} color="#10B981" icon="user-check" />
                    <SummaryCard compact label="A" value={String(monthStats.absent)} color="#EF4444" icon="user-x" />
                    <SummaryCard compact label="L" value={String(monthStats.leave)} color="#F59E0B" icon="clock" />
                    <SummaryCard compact label="%" value={monthStats.percent} color="#4CAF50" icon="bar-chart" />
                </ScrollView>

                {/* Week Headers */}
                <View style={styles.weekRow}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <Text key={d} style={styles.weekText}>{d}</Text>
                    ))}
                </View>

                {/* Calendar */}
                <View style={styles.calendarGrid}>
                    {calendar.map(day => (
                        <View key={day.key} style={styles.dayCell}>
                            {day.date ? (
                                <>
                                    <View style={[styles.statusCircle, day.status ? getStatusStyle(day.status) : null]} />
                                    <Text style={styles.dayNumber}>{day.date}</Text>
                                </>
                            ) : (
                                <View style={{ height: 30 }} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <LegendDot color="#10B981" label="Present" />
                    <LegendDot color="#EF4444" label="Absent" />
                    <LegendDot color="#F59E0B" label="Leave / Sunday" />
                </View>

                <View style={styles.legendContainer}>
                    <Text style={[styles.legendLabel, { fontStyle: "italic" }]}>
                        Dates without color = Not Marked
                    </Text>
                </View>

            </ScrollView>
        </StdSidebarLayout>
    );
};

export default StdAttendance;

/* ---------------- Helper Components ---------------- */

const SummaryCard = ({
    label,
    value,
    color,
    icon,
    compact = false,
}: {
    label: string;
    value: string;
    color: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    compact?: boolean;
}) => (
    <View style={[
        styles.summaryCard,
        compact && styles.compactCard,
        { borderLeftColor: color }
    ]}>
        <Feather name={icon} size={compact ? 16 : 20} color={color} />
        <Text style={[styles.summaryValue, compact && styles.compactValue]}>{value}</Text>
        <Text style={[styles.summaryLabel, compact && styles.compactLabel]}>{label}</Text>
    </View>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendLabel}>{label}</Text>
    </View>
);

const getStatusStyle = (status: AttendanceStatus) => {
    switch (status) {
        case "P": return { backgroundColor: "#10B981" };
        case "A": return { backgroundColor: "#EF4444" };
        case "L": return { backgroundColor: "#F59E0B" };
        default: return {};
    }
};

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
    container: { padding: 20 },

    /* Main summary cards */
    summaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    summaryCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        elevation: 3,
        alignItems: "center",
    },
    summaryValue: { fontSize: 20, fontWeight: "bold", marginTop: 8, color: "#1E293B" },
    summaryLabel: { color: "#6B7280", marginTop: 2 },

    /* COMPACT month-wise cards */
    compactCard: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        borderLeftWidth: 4,
        borderRadius: 10,
        backgroundColor: "#fff",
        elevation: 1,
        minWidth: 20,
        width: 90,
        alignItems: "center",
    },
    compactValue: { fontSize: 14, fontWeight: "bold", marginTop: 2 },
    compactLabel: { fontSize: 10, marginTop: 2, color: "#6B7280" },

    /* General Layout */
    monthSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
    },
    monthText: { fontSize: 18, fontWeight: "700", color: "#4F46E5" },

    /* Calendar */
    weekRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
    weekText: { width: "14%", textAlign: "center", color: "#6B7280", fontWeight: "600" },
    calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
    dayCell: { width: "14%", alignItems: "center", paddingVertical: 12 },
    dayNumber: { fontSize: 12, marginTop: 4, color: "#1E293B" },
    statusCircle: { width: 12, height: 12, borderRadius: 50 },

    /* Legend */
    legendContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
    legendDot: { width: 10, height: 10, borderRadius: 50, marginRight: 6 },
    legendLabel: { fontSize: 12, color: "#374151" },

    /* Loader */
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
