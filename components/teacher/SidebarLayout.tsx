import { handleLogout } from "@/api/logout";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SIDEBAR_WIDTH = 260;

type UserType = "student" | "teacher";

interface SidebarLayoutProps {
    headerTitle: string;
    children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
    headerTitle,
    children,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

    useEffect(() => {
        Animated.timing(sidebarAnim, {
            toValue: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [sidebarOpen]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const onLogout = async () => {
        await handleLogout();
        router.replace("/login");
    };

    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <Animated.View
                style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
            >
                <TouchableOpacity onPress={toggleSidebar} style={styles.closeButton}>
                    <Feather name="arrow-left" size={24} color="#6B46C1" />
                </TouchableOpacity>

                <Text style={styles.sidebarTitle}>Menu</Text>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => {
                        toggleSidebar();
                        router.push({ pathname: "/teacher/dashboard" });
                    }}
                >
                    <Feather name="home" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/allottedClasses" })}
                >
                    <Feather name="square" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Allotted Classes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/selectAttClass" })}
                >
                    <Feather name="check-square" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Mark Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/dailyTeaching" })}
                >
                    <Feather name="type" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Daily Teaching</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/studentObservation" })}
                >
                    <Feather name="activity" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Students Observation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/notice" })}
                >
                    <Feather name="message-circle" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Add Notice</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/details" })}
                >
                    <Feather name="user" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>My Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => router.push({ pathname: "/teacher/resetPassword" })}
                >
                    <Feather name="lock" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Reset Password</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={styles.sidebarItem}
                    onPress={() => alert("Contact Super Admin")}
                >
                    <Feather name="phone" size={20} color="#6B46C1" />
                    <Text style={styles.sidebarItemText}>Contact Super Admin</Text>
                </TouchableOpacity> */}

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.sidebarItem, styles.logoutItem]}
                    onPress={onLogout}
                >
                    <Feather name="log-out" size={20} color="#B91C1C" />
                    <Text style={[styles.sidebarItemText, { color: "#B91C1C" }]}>
                        Logout
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={toggleSidebar}>
                        <Feather name="menu" size={28} color="#6B46C1" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Page Content */}
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
                    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" >
                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default SidebarLayout;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EEF2FF" },

    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: "100%",
        backgroundColor: "white",
        paddingTop: 60,
        paddingHorizontal: 20,
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 15,
    },

    closeButton: { marginBottom: 20 },

    sidebarTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#6B46C1",
        marginBottom: 30,
        textAlign: "center",
    },

    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomColor: "#E5E7EB",
        borderBottomWidth: 1,
    },

    sidebarItemText: {
        marginLeft: 16,
        fontSize: 16,
        color: "#4C51BF",
    },

    logoutItem: { marginTop: 30 },

    header: {
        height: 60,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        justifyContent: "space-between",
        borderBottomColor: "#E5E7EB",
        borderBottomWidth: 1,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#6B46C1",
    },

    content: { padding: 20 },
});
