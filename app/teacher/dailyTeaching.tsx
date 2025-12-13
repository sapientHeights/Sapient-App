import { Feather } from "@expo/vector-icons";
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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import SidebarLayout from "@/components/teacher/SidebarLayout";
import { router } from "expo-router";

// Hooks
import { useSessions } from "@/hooks/use-sessions";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";


type FeatherIconName =
    | "chevron-down"
    | "check-square"
    | "type"
    | "activity"
    | "phone";


type DailyTeaching = {
    sessionId: string;
    studentClass: string;
    section: string;
    date: string;
    subject: string;
    topicCovered: string;
    homeWork: string;
    remarks: string;
};

const DailyTeaching = () => {
    const todayIST = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
    }).format(new Date());

    const initialFormData: DailyTeaching = {
        sessionId: "",
        studentClass: "",
        section: "",
        date: todayIST,
        subject: "",
        topicCovered: "",
        homeWork: "",
        remarks: "",
    };

    const [formData, setFormData] = useState<DailyTeaching>(initialFormData);
    const [pickerModal, setPickerModal] = useState<{
        field: keyof DailyTeaching;
        visible: boolean;
    }>({
        field: "sessionId",
        visible: false,
    });

    const { sessions, activeSession, isLoading: sessionsLoading } = useSessions();
    const { classes, teacherClassesData: tClassesData, isLoading: csLoading } =
        useTeacherClasses(formData.sessionId);
    const [sections, setSections] = useState([{ id: "", name: "" }]);
    const [subjects, setSubjects] = useState([{ id: "", name: "" }]);

    const [userData, setUserData] = useState<{
        name: string;
        tId: string;
        emailId: string;
    } | null>(null);

    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            let dataStr: string | null = null;

            if (Platform.OS === "web") dataStr = localStorage.getItem("user_data");
            else dataStr = await SecureStore.getItemAsync("user_data");

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

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            studentClass: "",
            section: "",
            subject: "",
        }));
    }, [formData.sessionId]);

    useEffect(() => {
        if (!tClassesData) return;

        const sec = tClassesData
            .filter((item) => item.classId === formData.studentClass)
            .map((item) => ({ id: item.section, name: item.section }));

        setSections(sec);
        setFormData((prev) => ({ ...prev, section: "", subject: "" }));
    }, [formData.studentClass]);

    useEffect(() => {
        if (!tClassesData) return;

        const sub = tClassesData
            .filter(
                (item) =>
                    item.classId === formData.studentClass &&
                    item.section === formData.section
            )
            .map((item) => ({ id: item.subjectId, name: item.subjectId }));

        setSubjects(sub);
        setFormData((prev) => ({ ...prev, subject: "" }));
    }, [formData.section]);

    const resetForm = () => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setFormData(initialFormData);
        Toast.show({ type: "success", text1: "Fields cleared!" });
    };

    const handleChange = (field: keyof DailyTeaching, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
    };

    const renderPicker = (
        field: keyof DailyTeaching,
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
                <Text style={{ color: formData[field] ? "#000" : "#9CA3AF" }}>
                    {formData[field]
                        ? options.find((opt) => opt.id === formData[field])?.name
                        : `Select ${label}`}
                </Text>
                <Feather name="chevron-down" size={20} color="#6B46C1" />
            </TouchableOpacity>

            {/* Picker Modal */}
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
                                    onPress={() => handleChange(field, item.id)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
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
        const dtData = {
            ...formData,
            classId: formData.studentClass,
            subjectId: formData.subject,
            tId: userData.tId,
        };

        try {
            const res = await fetch(`${BACKEND_URL}/saveDailyTeaching.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dtData }),
            });

            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: "Failed to save data" });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Daily Teaching submitted successfully",
                });
                resetForm();
            }
        } catch (err) {
            console.log(err);
            Toast.show({ type: "error", text1: "Some error occurred" });
        } finally {
            setPageLoading(false);
        }
    };

    const isLoading = csLoading || sessionsLoading || pageLoading;

    if (!userData || isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <SidebarLayout headerTitle="Daily Teaching">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Daily Teaching</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Add Daily Teaching</Text>

                    {renderPicker("sessionId", sessions || [], "Session", false)}
                    {renderPicker(
                        "studentClass",
                        classes || [],
                        "Class",
                        formData.sessionId === ""
                    )}
                    {renderPicker(
                        "section",
                        sections || [],
                        "Section",
                        formData.studentClass === ""
                    )}
                    {renderPicker(
                        "subject",
                        subjects || [],
                        "Subject",
                        formData.section === ""
                    )}

                    {/* Date */}
                    <Text style={styles.label}>Date</Text>
                    <View style={styles.dateBox}>
                        <Text>{formData.date}</Text>
                    </View>

                    {/* Topic */}
                    <Text style={styles.label}>Topics Covered</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            formData.section === "" && { opacity: 0.5 },
                        ]}
                        value={formData.topicCovered}
                        onChangeText={(text) => handleChange("topicCovered", text)}
                        placeholder="Enter topics covered"
                        multiline
                        editable={formData.section !== ""}
                    />

                    {/* Homework */}
                    <Text style={styles.label}>Home Work</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            formData.section === "" && { opacity: 0.5 },
                        ]}
                        value={formData.homeWork}
                        onChangeText={(text) => handleChange("homeWork", text)}
                        placeholder="Enter homework"
                        multiline
                        editable={formData.section !== ""}
                    />

                    {/* Remarks */}
                    <Text style={styles.label}>Remarks</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            formData.section === "" && { opacity: 0.5 },
                        ]}
                        value={formData.remarks}
                        onChangeText={(text) => handleChange("remarks", text)}
                        placeholder="Enter remarks"
                        multiline
                        editable={formData.section !== ""}
                    />

                    {/* Buttons */}
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
                                onPress={saveData}
                            >
                                <Text style={[styles.buttonText, { color: "#fff" }]}>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </SidebarLayout>
    );
};

export default DailyTeaching;

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F2937",
        textAlign: "center",
    },
    subTitle: { textAlign: "center", color: "#6B7280", marginBottom: 20 },
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
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { marginTop: 12, marginBottom: 6, fontWeight: "600", color: "#4A5568" },
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
    textArea: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 12,
        minHeight: 90,
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
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
});
