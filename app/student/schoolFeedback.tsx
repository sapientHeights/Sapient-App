import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type SchoolFeedback = {
    category: string;
    details: string;
}

const SchoolFeedback = () => {
    const initalSchoolFeedback = {
        category: "", details: ""
    };
    const [schoolFeedback, setSchoolFeedback] = useState(initalSchoolFeedback);
    const [loading, setLoading] = useState(false);
    const [pickerModal, setPickerModal] = useState<{
        field: keyof SchoolFeedback;
        visible: boolean;
    }>({ field: "category", visible: false });
    const [userData, setUserData] = useState<{
        name: string;
        sId: string;
        emailId: string;
        session: string;
        class: string;
        section: string;
    } | null>(null);

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

    const handleChange = (field: keyof SchoolFeedback, value: string) => {
        setSchoolFeedback((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
    };

    const resetForm = (showToast = true) => {
        if (JSON.stringify(schoolFeedback) === JSON.stringify(initalSchoolFeedback)) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setSchoolFeedback(initalSchoolFeedback);
        if(showToast){
            Toast.show({ type: "success", text1: "Fields cleared!" });
        }
    };

    const renderPicker = (
        field: keyof SchoolFeedback,
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
                <Text style={{ color: schoolFeedback[field] ? "#000" : "#9CA3AF" }}>
                    {schoolFeedback[field]
                        ? options.find((opt) => opt.id === schoolFeedback[field])?.name
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

    const saveData = async () => {
        if (JSON.stringify(schoolFeedback) === JSON.stringify(initalSchoolFeedback)) {
            Toast.show({ type: "error", text1: "Nothing to save" });
            return;
        }

        if (!userData) {
            Toast.show({ type: "error", text1: "Some error occurred" });
            router.replace("/login");
            return;
        }

        setLoading(true);

        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const sfData = {
            sessionId: userData.session,
            sId: userData.sId,
            date: new Date().toLocaleDateString("en-CA"),
            category: schoolFeedback.category,
            details: schoolFeedback.details
        };

        try {
            const res = await fetch(`${BACKEND_URL}/saveSchoolFeedback.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sfData }),
            });

            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: "Failed to save data" });
            } else {
                Toast.show({
                    type: "success",
                    text1: "School Feedback submitted successfully",
                });
                resetForm(false);
            }
        } catch (err) {
            console.log(err);
            Toast.show({ type: "error", text1: "Some error occurred" });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <StdSidebarLayout headerTitle="School Feedback">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>School Feedback</Text>
                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Add Feedback / Complains</Text>

                    {renderPicker("category", [{ id: 'Academic', name: 'Academic' }, { id: 'Infrastructure', name: 'Infrastructure' }, { id: 'Van', name: 'Van' }, { id: 'Activity', name: 'Activity' }, { id: 'Fee', name: 'Fee' }], "Category", false)}

                    <Text style={[styles.label, { marginTop: 20 }]}>Feedback / Complain</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            !schoolFeedback.category && { opacity: 0.5 },
                        ]}
                        value={schoolFeedback.details}
                        onChangeText={(text) => handleChange("details", text)}
                        placeholder="Enter Feedback / Complain"
                        multiline
                        numberOfLines={6}
                        maxLength={1000}
                        editable={!!schoolFeedback.category}
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
        </StdSidebarLayout>
    )
}

export default SchoolFeedback;

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mainTitle: { fontSize: 28, fontWeight: "bold", color: "#1F2937", textAlign: "center" },
    subTitle: { textAlign: "center", color: "#6B7280", marginBottom: 20 },
    formBox: { backgroundColor: "#fff", borderRadius: 20, padding: 25, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { marginTop: 12, marginBottom: 6, color: "#4A5568", fontWeight: "600" },
    customPicker: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
    modalBox: { backgroundColor: "#fff", marginHorizontal: 30, borderRadius: 20, maxHeight: "70%", paddingVertical: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
    modalItem: { paddingVertical: 14, paddingHorizontal: 20 },
    modalItemText: { fontSize: 16 },
    modalCancel: { padding: 14, alignItems: "center", borderTopWidth: 1, borderColor: "#E5E7EB" },
    modalCancelText: { color: "#6B46C1", fontWeight: "600", fontSize: 16 },
    textArea: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 12, minHeight: 80, textAlignVertical: "top" },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    resetBtn: { backgroundColor: "#E5E7EB", flex: 0.45, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    submitBtn: { flex: 0.45, borderRadius: 12, overflow: "hidden" },
    buttonText: { fontWeight: "700" },
})