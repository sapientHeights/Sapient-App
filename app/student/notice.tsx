import Button from "@/components/Button";
import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import UniversalDatePicker from "@/components/UniversalDatePicker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

type NoticeData = {
    noticeId: string;
    sessionId: string;
    date: string;
    title: string;
    subject: string;
    message: string;
    image: string;
    createdBy: string;
};

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const Notice = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [notices, setNotices] = useState<NoticeData[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    const loadNotices = async () => {
        let userDataStr: string | null = null;
        if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
        else userDataStr = await SecureStore.getItemAsync("user_data");

        if (!userDataStr) {
            Toast.show({ type: "error", text1: "Error", text2: "User not found" });
            router.replace("/login");
            return;
        }

        const userData = JSON.parse(userDataStr);

        setLoading(true);
        setNotices([]);

        try {
            const res = await fetch(`${BACKEND_URL}/getNotices.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: userData.session,
                    date: selectedDate.toLocaleDateString("en-CA")
                }),
            });

            const data = await res.json();

            if (!data.error) {
                setNotices(data.noticesData);
            } else {
                setNotices([]); // Ensure no data shows correctly
            }
        } catch (err) {
            console.log(err);
            Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotices();
    }, [selectedDate]);

    const openModal = (url: string) => {
        setModalImageUrl(url);
        setModalVisible(true);
    };

    const renderNoticeImage = (pic: string | null, sessionId: string) => {
        if (!pic) {
            return (
                <View style={styles.noticeIconWrapper}>
                    <Feather name="file-text" size={28} color="#6B46C1" />
                </View>
            );
        }

        const imageUrl = `${BACKEND_URL}/uploads/notices/${sessionId}/${pic}`;

        return (
            <TouchableOpacity onPress={() => openModal(imageUrl)}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.noticeImageSmall}
                />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <StdSidebarLayout headerTitle="Notice">
            <View style={{ flex: 1 }}>

                {/* 🔼 TOP SECTION WITH DATE PICKER */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.pickerLabel}>Select Date</Text>

                    <UniversalDatePicker
                        value={selectedDate}
                        onChange={(d) => setSelectedDate(d)}
                    />

                    <Text style={styles.title}>
                        Notices for {selectedDate.toDateString()}
                    </Text>
                </View>

                {/* 🔽 Scrollable Notices List */}
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {notices.length === 0 ? (
                        <View style={styles.noDataBox}>
                            <Feather name="inbox" size={50} color="#A5B4FC" />
                            <Text style={styles.noDataText}>No notices available</Text>
                        </View>
                    ) : (
                        notices.map((item) => (
                            <View key={item.noticeId} style={styles.noticeCard}>
                                <View style={styles.leftAccent} />

                                {renderNoticeImage(item.image, item.sessionId)}

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.noticeTitle}>{item.title}</Text>
                                    <Text style={styles.noticeSubject}>{item.subject}</Text>
                                    <Text style={styles.noticeDesc}>{item.message}</Text>
                                    <Text style={styles.noticeMeta}>
                                        {item.createdBy} • {item.date}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            <Modal visible={modalVisible} transparent>
                <View style={styles.modalBackground}>
                    <TouchableOpacity
                        style={styles.modalCloseArea}
                        onPress={() => setModalVisible(false)}
                    />
                    {modalImageUrl && (
                        <Image
                            source={{ uri: modalImageUrl }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    )}
                    <Button text="Close" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </StdSidebarLayout>
    );
};

export default Notice;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    title: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 12,
        color: "#1E293B",
    },

    pickerLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4C51BF",
        marginBottom: 8,
    },

    /* Notice Card */
    noticeCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginVertical: 10,
        borderRadius: 18,
        padding: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    leftAccent: {
        width: 6,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#6B46C1",
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    noticeSubject: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6D28D9",
        marginTop: 2,
        marginBottom: 6,
    },
    noticeDesc: {
        fontSize: 14,
        color: "#4B5563",
        marginTop: 4,
    },
    noticeMeta: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
    },

    /* No data */
    noDataBox: {
        marginTop: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    noDataText: {
        marginTop: 10,
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "500",
    },

    noticeIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
    },

    noticeImageSmall: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
    modalCloseArea: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    modalImage: { width: "90%", height: "70%", borderRadius: 12 }
});
