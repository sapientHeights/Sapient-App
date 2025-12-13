import { Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import SidebarLayout from "@/components/teacher/SidebarLayout";
import UniversalDatePicker from '@/components/UniversalDatePicker';
import { AcademicData } from "@/constants/academic";
import { useSessions } from "@/hooks/use-sessions";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";
import { useRouter } from "expo-router";

export default function SelectAttClass() {
    const router = useRouter();

    const todayIST = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
    }).format(new Date());

    const initialAcademicData: AcademicData = {
        sessionId: "",
        studentClass: "",
        section: "",
        date: todayIST,
    };

    const [academicData, setAcademicData] =
        useState<AcademicData>(initialAcademicData);
    const [userData, setUserData] = useState<{
        name: string;
        tId: string;
        emailId: string;
    } | null>(null);

    const { sessions, activeSession, isLoading: sessionsLoading } = useSessions();
    const { classes, teacherClassesData: tClassesData, isLoading: csLoading } =
        useTeacherClasses(academicData.sessionId);

    const [sections, setSections] = useState([{ id: "", name: "" }]);
    const [showPicker, setShowPicker] = useState(false);

    const [pickerModal, setPickerModal] = useState<{
        field: keyof AcademicData;
        visible: boolean;
    }>({
        field: "sessionId",
        visible: false,
    });

    const isLoading = csLoading || sessionsLoading;

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            let dataStr: string | null = null;

            if (Platform.OS === "web")
                dataStr = localStorage.getItem("user_data");
            else dataStr = await SecureStore.getItemAsync("user_data");

            if (!dataStr) {
                router.replace("/login");
                return;
            }

            setUserData(JSON.parse(dataStr));
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (activeSession) {
            setAcademicData(prev => ({
                ...prev,
                sessionId: activeSession
            }));
        }
    }, [activeSession]);

    // Reset class & section when session changes
    useEffect(() => {
        setAcademicData((prev) => ({
            ...prev,
            studentClass: "",
            section: "",
        }));
    }, [academicData.sessionId]);

    // Load sections when class changes
    useEffect(() => {
        if (!tClassesData) return;

        const sectionsData = tClassesData
            .filter((item) => item.classId === academicData.studentClass)
            .map((item) => ({
                id: item.section,
                name: item.section,
            }));

        setSections(sectionsData);
        setAcademicData((prev) => ({ ...prev, section: "" }));
    }, [academicData.studentClass]);

    const handleChange = (field: keyof AcademicData, value: string) => {
        setAcademicData((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
    };

    const resetForm = () => {
        if (JSON.stringify(academicData) === JSON.stringify(initialAcademicData)) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setAcademicData(initialAcademicData);
        Toast.show({ type: "success", text1: "Fields cleared!" });
    };

    const saveAndContinue = async () => {
        if (
            !academicData.sessionId ||
            !academicData.studentClass ||
            !academicData.section || !academicData.date
        ) {
            Toast.show({
                type: "error",
                text1: "Missing Fields",
                text2: "Please fill all fields",
            });
            return;
        }

        if (new Date(academicData.date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) {
            Toast.show({
                type: "error",
                text1: "Invalid Date",
                text2: "Attendance cannot be marked for future dates",
            });
            return;
        }

        if (new Date(academicData.date).setHours(0, 0, 0, 0) < (new Date().setHours(0, 0, 0, 0) - (2 * 24 * 60 * 60 * 1000))) {
            Toast.show({
                type: "error",
                text1: "Invalid Date",
                text2: "Attendance cannot be marked for more than two past days",
            });
            return;
        }

        const dataStr = JSON.stringify(academicData);

        if (Platform.OS === "web")
            localStorage.setItem("academic_data", dataStr);
        else await SecureStore.setItemAsync("academic_data", dataStr);

        router.push({ pathname: '/teacher/markAttendance' });
    };

    // Custom Picker
    const renderPicker = (
        field: keyof AcademicData,
        options: { id: string; name: string }[],
        label: string,
        disabled: boolean
    ) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                disabled={disabled}
                style={[
                    styles.customPicker,
                    disabled && { opacity: 0.5 },
                ]}
                onPress={() =>
                    !disabled && setPickerModal({ field, visible: true })
                }
            >
                <Text
                    style={{
                        color: academicData[field] ? "#000" : "#9CA3AF",
                    }}
                >
                    {academicData[field]
                        ? options.find((o) => o.id === academicData[field])?.name
                        : `Select ${label}`}
                </Text>
                <Feather name="chevron-down" size={20} color="#6B46C1" />
            </TouchableOpacity>

            <Modal
                visible={pickerModal.field === field && pickerModal.visible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select {label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() =>
                                        handleChange(field, item.id)
                                    }
                                >
                                    <Text style={styles.modalItemText}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() =>
                                setPickerModal({ field, visible: false })
                            }
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );

    const onDateChange = (date: Date) => {
        setAcademicData((prev) => ({ ...prev, ["date"]: date.toLocaleDateString("en-CA") }));
    };

    if (!userData || isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <SidebarLayout headerTitle="Mark Attendance">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Manage Attendance</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Attendance Details</Text>

                    {renderPicker("sessionId", sessions || [], "Session", false)}
                    {renderPicker(
                        "studentClass",
                        classes || [],
                        "Class",
                        academicData.sessionId === ""
                    )}
                    {renderPicker(
                        "section",
                        sections || [],
                        "Section",
                        academicData.studentClass === ""
                    )}

                    <Text style={styles.label}>Date</Text>
                    {/* <View style={styles.dateBox}>
                        <Text>{academicData.date}</Text>
                    </View> */}

                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
                        <Feather name="calendar" size={18} color="#4F46E5" />
                        <Text style={styles.dateText}>{academicData.date}</Text>
                    </TouchableOpacity>

                    {showPicker && <UniversalDatePicker value={new Date(academicData.date)} onChange={onDateChange} />}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resetBtn} onPress={resetForm}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>

                        <LinearGradient
                            colors={["#7F00FF", "#E100FF"]}
                            style={styles.submitBtn}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={saveAndContinue}
                            >
                                <Text
                                    style={[styles.buttonText, { color: "#fff" }]}
                                >
                                    Mark Attendance
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F2937",
        textAlign: "center",
    },
    subTitle: {
        textAlign: "center",
        color: "#6B7280",
        marginBottom: 20,
    },
    formBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        color: "#2D3748",
    },
    label: {
        marginTop: 12,
        marginBottom: 6,
        color: "#4A5568",
        fontWeight: "600",
    },
    customPicker: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateBox: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#F8FAFC",
        marginTop: 5,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    resetBtn: {
        backgroundColor: "#E5E7EB",
        flex: 0.3,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    submitBtn: {
        flex: 0.6,
        borderRadius: 12,
        overflow: "hidden",
    },
    buttonText: {
        fontWeight: "700",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        marginHorizontal: 30,
        borderRadius: 20,
        maxHeight: "70%",
        paddingVertical: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    modalItem: { paddingVertical: 14, paddingHorizontal: 20 },
    modalItemText: { fontSize: 16 },
    modalCancel: {
        padding: 14,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
    },
    modalCancelText: {
        color: "#6B46C1",
        fontWeight: "600",
        fontSize: 16,
    },
    dateInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEF2FF", padding: 12, borderRadius: 10, marginBottom: 10 },
    dateText: { marginLeft: 8, color: "#1E293B", fontWeight: "500" },
});
