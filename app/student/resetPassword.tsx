import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const ResetPassword = () => {
    const router = useRouter();

    const [pageLoading, setPageLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rePasswordVisible, setRePasswordVisible] = useState(false);

    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    // Load user info
    useEffect(() => {
        const loadUser = async () => {
            let dataStr: string | null = null;

            dataStr =
                Platform.OS === "web"
                    ? localStorage.getItem("user_data")
                    : await SecureStore.getItemAsync("user_data");

            if (dataStr) {
                const parsed = JSON.parse(dataStr);
                setUserId(parsed?.sId);
            } else {
                router.replace("/login");
            }
        };
        loadUser();
    }, []);

    const clearFields = () => {
        if (!password && !rePassword) {
            Toast.show({ type: "error", text1: "Nothing to clear" });
            return;
        }
        setPassword("");
        setRePassword("");
        setPasswordVisible(false);
        setRePasswordVisible(false);
        Toast.show({ type: "success", text1: "Fields cleared!" });
    };

    const handleReset = async () => {
        if (!password || !rePassword) {
            Toast.show({ type: "error", text1: "Please fill all fields" });
            return;
        }

        if (password !== rePassword) {
            Toast.show({ type: "error", text1: "Passwords do not match" });
            return;
        }

        setPageLoading(true);

        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

        try {
            const res = await fetch(`${BACKEND_URL}/resetAppPassword.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, newPassword: password, userType: 'student' }),
            });

            const data = await res.json();

            if (data.error) {
                Toast.show({ type: "error", text1: "Failed to reset password" });
            } else {
                Toast.show({ type: "success", text1: "Password Reset Successfully" });
                setPassword("");
                setRePassword("");
                setPasswordVisible(false);
                setRePasswordVisible(false);
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Some error occurred" });
        } finally {
            setPageLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    return (
        <StdSidebarLayout headerTitle="Reset Password">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.mainTitle}>Sapient Heights</Text>
                <Text style={styles.subTitle}>Reset Your Password</Text>

                <View style={styles.formBox}>
                    <Text style={styles.sectionTitle}>Reset Password</Text>

                    {/* Password */}
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter new password"
                        />
                        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                            <Feather name={passwordVisible ? "eye" : "eye-off"} size={16} color="#6B46C1" />
                        </TouchableOpacity>
                    </View>

                    {/* Re-enter Password */}
                    <Text style={styles.label}>Re-enter Password</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!rePasswordVisible}
                            value={rePassword}
                            onChangeText={setRePassword}
                            placeholder="Confirm password"
                        />
                        <TouchableOpacity onPress={() => setRePasswordVisible(!rePasswordVisible)}>
                            <Feather name={rePasswordVisible ? "eye" : "eye-off"} size={16} color="#6B46C1" />
                        </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resetBtn} onPress={clearFields}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>

                        <LinearGradient colors={["#7F00FF", "#E100FF"]} style={styles.submitBtn}>
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                                onPress={handleReset}
                            >
                                <Text style={[styles.buttonText, { color: "#fff" }]}>Reset</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </StdSidebarLayout>
    );
};

export default ResetPassword;

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mainTitle: { fontSize: 28, fontWeight: "bold", color: "#1F2937", textAlign: "center" },
    subTitle: { textAlign: "center", color: "#6B7280", marginBottom: 20 },
    formBox: { backgroundColor: "#fff", borderRadius: 20, padding: 25, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { marginTop: 12, marginBottom: 6, color: "#4A5568", fontWeight: "600" },
    inputWrapper: { flexDirection: "row", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 12, justifyContent: "space-between", alignItems: "center" },
    input: { flex: 1, marginRight: 10 },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    resetBtn: { backgroundColor: "#E5E7EB", flex: 0.45, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    submitBtn: { flex: 0.45, borderRadius: 12, overflow: "hidden" },
    buttonText: { fontWeight: "700" },
});
