import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

import SidebarLayout from "@/components/teacher/SidebarLayout";
import { useClasses } from "@/hooks/use-classes";
import { useSections } from "@/hooks/use-sections";
import { useSessions } from "@/hooks/use-sessions";
import { useStudentsByClass } from "@/hooks/use-students-by-class";

type StudentObservation = {
    sessionId: string;
    classId: string;
    section: string;
    date: string;
    sId: string;
    observation: string;
};

export default function StudentObservation() {
    const router = useRouter();

    const todayIST = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
    }).format(new Date());

    const initialFormData: StudentObservation = {
        sessionId: "",
        classId: "",
        section: "",
        date: todayIST,
        sId: "",
        observation: "",
    };

    const [formData, setFormData] = useState<StudentObservation>(initialFormData);
    const [pickerModal, setPickerModal] = useState<{
        field: keyof StudentObservation;
        visible: boolean;
    }>({ field: "sessionId", visible: false });

    const { sessions, activeSession, isLoading: sessionsLoading } = useSessions();
    // const { classes, teacherClassesData: tClassesData, isLoading: csLoading } =
    //     useTeacherClasses(formData.sessionId);

    const { classes, isLoading: csLoading } = useClasses();
    const { sections, isLoading: sLoading } = useSections(formData.classId);

    const { studentsIdName, isLoading: studentsLoading } = useStudentsByClass(
        formData.sessionId,
        formData.classId,
        formData.section
    );

    // const [sections, setSections] = useState([{ id: "", name: "" }]);
    const [userData, setUserData] = useState<{ name: string; tId: string; emailId: string } | null>(
        null
    );
    const [pageLoading, setPageLoading] = useState(false);

    // Load user
    useEffect(() => {
        const loadUser = async () => {
            let dataStr: string | null = null;

            dataStr =
                Platform.OS === "web"
                    ? localStorage.getItem("user_data")
                    : await SecureStore.getItemAsync("user_data");

            if (dataStr) setUserData(JSON.parse(dataStr));
            else router.replace("/login");
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (activeSession) {
            setFormData(prev => ({
                ...prev,
                sessionId: activeSession
            }));
        }
    }, [activeSession]);

    // Reset dependent fields when session changes
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            classId: "",
            section: "",
            sId: "",
        }));
    }, [formData.sessionId]);

    // Update sections
    useEffect(() => {
        setFormData((prev) => ({ ...prev, section: "", sId: "" }));
    }, [formData.classId]);

    const resetForm = (showToast = true) => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
            if (showToast) {
                Toast.show({ type: "error", text1: "Nothing to clear" });
            }
            return;
        }
        setFormData(initialFormData);
        if (showToast) Toast.show({ type: "success", text1: "Fields cleared!" });
    };

    const handleChange = (field: keyof StudentObservation, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
    };

    // Picker component
    const renderPicker = (
        field: keyof StudentObservation,
        options: { id: string; name: string }[],
        label: string,
        disabled: boolean
    ) => {
        const isEmpty = options.length === 0;
        return (
            <>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity
                    disabled={disabled}
                    style={[
                        styles.customPicker,
                        (disabled || isEmpty) && { opacity: 0.5 },
                    ]}
                    onPress={() =>
                        !disabled && !isEmpty && setPickerModal({ field, visible: true })
                    }
                >
                    <Text style={{ color: formData[field] ? "#000" : "#9CA3AF" }}>
                        {formData[field]
                            ? options.find((opt) => opt.id === formData[field])?.name
                            : isEmpty
                                ? `No Data available`
                                : `Select ${label.toLowerCase()}`}
                    </Text>
                    <Feather name="chevron-down" size={20} color="#6B46C1" />
                </TouchableOpacity>

                <Modal visible={pickerModal.field === field && pickerModal.visible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Select {label}</Text>

                            {isEmpty ? (
                                <View style={{ padding: 20 }}>
                                    <Text style={{ textAlign: "center", color: "#777" }}>
                                        No {label.toLowerCase()} available
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={options}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => handleChange(field, item.id)}
                                        >
                                            <Text style={styles.modalItemText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}

                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setPickerModal({ field, visible: false })}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </>
        )
    };

    // Save data
    const saveData = async () => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
            Toast.show({ type: "error", text1: "Nothing to save" });
            return;
        }

        if (!userData) {
            Toast.show({ type: "error", text1: "Some error occurred" });
            router.replace("/login");
            return;
        }

        setPageLoading(true);

        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

        try {
            const res = await fetch(`${BACKEND_URL}/saveStdObservation.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    obsData: {
                        ...formData,
                        tId: userData.tId,
                    },
                }),
            });

            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: data.message });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Student Observation submitted",
                });
                resetForm(false);
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Some error occurred" });
        } finally {
            setPageLoading(false);
        }
    };

    const isLoading = sessionsLoading || csLoading || sLoading || studentsLoading || pageLoading;

    if (!userData || isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <SidebarLayout headerTitle="Student Observation" >
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Student Observation</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Add Student Observation</Text>

                    {renderPicker("sessionId", sessions || [], "Session", false)}
                    {renderPicker("classId", classes || [], "Class", !formData.sessionId)}
                    {renderPicker("section", sections || [], "Section", !formData.classId)}
                    {renderPicker("sId", studentsIdName || [], "Student", !formData.section)}

                    {/* Date */}
                    <Text style={styles.label}>Date</Text>
                    <View style={styles.dateBox}>
                        <Text>{formData.date}</Text>
                    </View>

                    {/* Observation */}
                    <Text style={styles.label}>Observation</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            !formData.sId && { opacity: 0.5 },
                        ]}
                        value={formData.observation}
                        onChangeText={(text) => handleChange("observation", text)}
                        placeholder="Enter Observation"
                        multiline
                        numberOfLines={4}
                        editable={!!formData.sId}
                    />

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resetBtn} onPress={() => resetForm()}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>

                        <LinearGradient colors={["#7F00FF", "#E100FF"]} style={styles.submitBtn}>
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                                onPress={saveData}
                            >
                                <Text style={[styles.buttonText, { color: "#fff" }]}>Submit</Text>
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
    mainTitle: { fontSize: 28, fontWeight: "bold", color: "#1F2937", textAlign: "center" },
    subTitle: { textAlign: "center", color: "#6B7280", marginBottom: 20 },
    formBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { marginTop: 12, marginBottom: 6, color: "#4A5568", fontWeight: "600" },
    customPicker: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
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
    textArea: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
    },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    resetBtn: {
        backgroundColor: "#E5E7EB",
        flex: 0.45,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    submitBtn: { flex: 0.45, borderRadius: 12, overflow: "hidden" },
    buttonText: { fontWeight: "700" },
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
    modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
    modalItem: { paddingVertical: 14, paddingHorizontal: 20 },
    modalItemText: { fontSize: 16 },
    modalCancel: {
        padding: 14,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
    },
    modalCancelText: { color: "#6B46C1", fontWeight: "600", fontSize: 16 },
});
