import SidebarLayout from "@/components/teacher/SidebarLayout";
import { useSessions } from "@/hooks/use-sessions";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type SelectionData = {
    sessionId: string;
}

type ClassData = {
    sessionId: string;
    classId: string;
    section: string;
    subjectId: string;
    tId: string;
}

export default function AllottedClasses() {
    const initalSelectionData = {
        sessionId: ""
    }
    const [selectionData, setSelectionData] = useState(initalSelectionData);

    const { sessions, activeSession, isLoading: sessionsLoading } = useSessions();
    const { classes, teacherClassesData: tClassesData, isLoading: csLoading } =
        useTeacherClasses(selectionData.sessionId);

    const [loading, setLoading] = useState(false);
    const [pickerModal, setPickerModal] = useState<{
        field: string;
        visible: boolean;
    }>({
        field: "sessionId",
        visible: false,
    });

    const [showClasses, setShowClasses] = useState(false);

    useEffect(() => {
        if (activeSession) {
            setSelectionData(prev => ({
                ...prev,
                sessionId: activeSession
            }));
        }
    }, [activeSession]);

    const handleChange = (field: keyof SelectionData, value: string) => {
        setSelectionData((prev) => ({ ...prev, [field]: value }));
        setPickerModal({ field, visible: false });
        setShowClasses(false); // hide previous data on new selection
    };

    const resetForm = () => {
        if (JSON.stringify(selectionData) === JSON.stringify(initalSelectionData)) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setSelectionData(initalSelectionData);
        setShowClasses(false);
        Toast.show({ type: "success", text1: "Fields cleared!" });
    };


    const renderPicker = (
        field: keyof SelectionData,
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
                        color: selectionData[field] ? "#000" : "#9CA3AF",
                    }}
                >
                    {selectionData[field]
                        ? options.find((o) => o.id === selectionData[field])?.name
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

    const saveAndContinue = () => {
        if (!selectionData.sessionId) {
            Toast.show({ type: "error", text1: "Select a session first" });
            return;
        }
        setShowClasses(true); // show the classes below
    }

    const isLoading = loading || sessionsLoading || csLoading;

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <SidebarLayout headerTitle="Allotted Classes">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>View Allotted Classes</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Session Details</Text>

                    {renderPicker("sessionId", sessions || [], "Session", false)}

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
                                    View Classes
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>

                {/* ------------------- Show Classes ------------------- */}
                {showClasses && tClassesData && tClassesData.length > 0 && (
                    <View style={{ marginTop: 25 }}>
                        <Text style={styles.sectionTitle}>Allotted Classes</Text>
                        {tClassesData.map((cls: ClassData, index: number) => (
                            <View key={index} style={styles.classCard}>
                                <Text style={styles.classText}><Text style={styles.bold}>Session:</Text> {cls.sessionId}</Text>
                                <Text style={styles.classText}><Text style={styles.bold}>Class:</Text> {cls.classId}</Text>
                                <Text style={styles.classText}><Text style={styles.bold}>Section:</Text> {cls.section}</Text>
                                <Text style={styles.classText}><Text style={styles.bold}>Subject:</Text> {cls.subjectId}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {showClasses && tClassesData && tClassesData.length === 0 && (
                    <Text style={{ textAlign: "center", marginTop: 20, color: "#6B7280" }}>No classes allotted for this session.</Text>
                )}
            </ScrollView>
        </SidebarLayout>
    )
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
    classCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    classText: {
        fontSize: 14,
        marginBottom: 6,
    },
    bold: { fontWeight: "700" },
});
