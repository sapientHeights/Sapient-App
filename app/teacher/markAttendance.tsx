import AttAcademicCard from "@/components/teacher/AttAcademicCard";
import AttendanceList from "@/components/teacher/AttendanceList";
import SidebarLayout from "@/components/teacher/SidebarLayout";
import { AcademicData } from "@/constants/academic";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type AttData = {
    sId: string;
    teacherName: string;
    studentName: string;
    sessionId: string;
    classId: string;
    section: string;
    classDate: string;
    att: string;
    markedBy: string;
};

export default function MarkAttendance() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [attData, setAttData] = useState<AttData[]>([]);
    const [user, setUser] = useState<{ name: string; tId: string; emailId: string } | null>(null);
    const [academicData, setAcademicData] = useState<AcademicData>({
        sessionId: "",
        studentClass: "",
        section: "",
        date: "",
    });
    const [noData, setNoData] = useState(false);
    const [notMarked, setNotMarked] = useState(false);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchAttData = async () => {
        setLoading(true);
        let academicDataStr: string | null = null;
        let userDataStr: string | null = null;

        if (Platform.OS === "web") {
            academicDataStr = localStorage.getItem("academic_data");
            userDataStr = localStorage.getItem("user_data");
        } else {
            academicDataStr = await SecureStore.getItemAsync("academic_data");
            userDataStr = await SecureStore.getItemAsync("user_data");
        }

        if (!academicDataStr || !userDataStr) {
            Toast.show({ type: "error", text1: "Error", text2: "Some error occurred" });
            if (!userDataStr) router.replace('/login');
            else router.replace("/teacher/selectAttClass");
            return;
        }

        const academic = JSON.parse(academicDataStr);
        const userData = JSON.parse(userDataStr);

        setAcademicData(academic);
        setUser(userData);

        try {
            const res = await fetch(`${BACKEND_URL}/getAttendanceData.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: academic.sessionId,
                    classId: academic.studentClass,
                    section: academic.section,
                    date: academic.date,
                }),
            });

            const data = await res.json();

            if (!data.error) {
                const sortedData = data.attData.sort((a: AttData, b:AttData) => a.studentName.localeCompare(b.studentName));
                sortedData.forEach((data : AttData) => {
                    if(data.att === undefined){
                        data.att = 'P';
                        if(notMarked === false) setNotMarked(true);
                    }
                });
                setAttData(sortedData);
            } else {
                setNoData(true);
                Toast.show({ type: "error", text1: "No Data", text2: "Failed to fetch Attendance Data" });
            }
        } catch (err) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: "Some error occurred" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttData();
    }, []);

    const handleAttChange = (selectedAtt: string, sId: string) => {
        const att = selectedAtt === "Present" ? "P" : selectedAtt === "Absent" ? "A" : "L";
        setAttData((prevData) =>
            prevData.map((data) =>
                data.sId === sId
                    ? {
                        ...data,
                        sessionId: academicData.sessionId,
                        classId: academicData.studentClass,
                        section: academicData.section,
                        classDate: academicData.date,
                        att,
                        markedBy: user?.emailId || "SYSTEM",
                    }
                    : data
            )
        );
    };

    const saveAttData = async () => {
        const noAtt = attData.find((data) => data.att === undefined);
        if (noAtt) {
            Toast.show({ type: "error", text1: "Invalid Data", text2: "Please fill the attendance" });
            return;
        }

        const dataToSend = {
            attData: attData.map((data) => ({
                ...data,
                sessionId: data.sessionId || academicData.sessionId,
                classId: data.classId || academicData.studentClass,
                section: data.section || academicData.section,
                classDate: data.classDate || academicData.date,
                markedBy: data.markedBy || user?.emailId || "SYSTEM",
            })),
        };

        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/saveAttendanceData.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });
            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: "Error", text2: "Failed to Save Attendance" });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Attendance Saved!",
                    text2: "Your attendance has been successfully updated.",
                    position: "top",
                });
            }
        } catch (err) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to Save Attendance" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <SidebarLayout headerTitle="Mark Attendance">
            <ScrollView style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                nestedScrollEnabled
            >
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Manage Attendance</Text>
                <AttAcademicCard academicData={academicData} attCount={attData.length} />
                <View style={{ marginTop: 20 }}>
                    <AttendanceList
                        attData={attData}
                        handleAttChange={handleAttChange}
                        saveAttData={saveAttData}
                        noData={noData}
                        notMarked = {notMarked}
                    />
                </View>
            </ScrollView>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mainTitle: { fontSize: 28, fontWeight: "bold", color: "#1F2937", textAlign: "center" },
    subTitle: { textAlign: "center", color: "#6B7280", marginBottom: 20 },
});
