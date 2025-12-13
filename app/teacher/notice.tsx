import SidebarLayout from "@/components/teacher/SidebarLayout";
import UniversalDatePicker from "@/components/UniversalDatePicker";
import { useSessions } from "@/hooks/use-sessions";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type NoticeData = {
    sessionId: string;
    date: string;
    title: string;
    subject: string;
    message: string;
}

const Notice = () => {
    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);
    const { sessions, activeSession, isLoading: sessionsLoading } = useSessions();
    const [pageLoading, setPageLoading] = useState(false);

    const [userData, setUserData] = useState<{ name: string; tId: string; emailId: string } | null>(null);

    const [pickerModal, setPickerModal] = useState<{
        field: keyof NoticeData;
        visible: boolean;
    }>({ field: "sessionId", visible: false });

    const initialFormData = {
        sessionId: "", date: new Date().toLocaleDateString("en-CA"), title: "", subject: "", message: ""
    }

    const [formData, setFormData] = useState(initialFormData);

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


    const handleChange = (field: keyof NoticeData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
    };

    const renderPicker = (
        field: keyof NoticeData,
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
                        : `Select ${label.toLowerCase()}`}
                </Text>
                <Feather name="chevron-down" size={20} color="#6B46C1" />
            </TouchableOpacity>

            <Modal visible={pickerModal.field === field && pickerModal.visible} transparent animationType="slide">
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
                            onPress={() => setPickerModal({ field, visible: false })}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );

    const resetForm = () => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setFormData(initialFormData);
        Toast.show({ type: "success", text1: "Fields cleared!" });
    };

    const onDateChange = (date: Date) => {
        setFormData((prev) => ({ ...prev, ["date"]: date.toLocaleDateString("en-CA") }));
        //setSelectedDate(date);
    };

    const saveData = async () => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
            Toast.show({ type: "error", text1: "Nothing to save" });
            return;
        }

        if (new Date(formData.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
            Toast.show({ type: "error", text1: "Invalid Date" });
            return;
        }

        setPageLoading(true);

        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

        const noticeData = {
            sessionId: formData.sessionId,
            date: formData.date,
            title: formData.title,
            subject: formData.subject,
            message: formData.message,
            createdBy: userData?.emailId
        }

        try {
            const res = await fetch(`${BACKEND_URL}/saveNotice.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    noticeData
                }),
            });

            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: "Failed to save data" });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Notice saved",
                });
                resetForm();
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Some error occurred" });
        } finally {
            setPageLoading(false);
        }
    }

    const isLoading = sessionsLoading || pageLoading;

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }


    return (
        <SidebarLayout headerTitle="Create Notice" >
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Add Notices</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Create Notice</Text>

                    {renderPicker("sessionId", sessions || [], "Session", false)}

                    <Text style={styles.label}>Select Date</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
                        <Feather name="calendar" size={18} color="#4F46E5" />
                        <Text style={styles.dateText}>{formData.date}</Text>
                    </TouchableOpacity>

                    {showPicker && <UniversalDatePicker value={new Date(formData.date)} onChange={onDateChange} />}

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            (!formData.sessionId || !formData.date) && { opacity: 0.5 },
                        ]}
                        value={formData.title}
                        onChangeText={(text) => handleChange("title", text)}
                        placeholder="Enter title"
                        multiline
                        numberOfLines={2}
                        editable={!!formData.date}
                    />

                    <Text style={styles.label}>Subject</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            (!formData.sessionId || !formData.date) && { opacity: 0.5 },
                        ]}
                        value={formData.subject}
                        onChangeText={(text) => handleChange("subject", text)}
                        placeholder="Enter Subject"
                        multiline
                        numberOfLines={2}
                        editable={!!formData.title}
                    />

                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            (!formData.sessionId || !formData.date) && { opacity: 0.5 },
                        ]}
                        value={formData.message}
                        onChangeText={(text) => handleChange("message", text)}
                        placeholder="Enter message"
                        multiline
                        numberOfLines={4}
                        editable={!!formData.subject}
                    />

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resetBtn} onPress={resetForm}>
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
    )
}

export default Notice;

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
    customPicker: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
    dateInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEF2FF", padding: 12, borderRadius: 10, marginBottom: 10 },
    dateText: { marginLeft: 8, color: "#1E293B", fontWeight: "500" },
})