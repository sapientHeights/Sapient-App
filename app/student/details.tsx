import Button from "@/components/Button";
import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type StudentAllData = {
    sId: string;
    studentName: string;
    dob: string;
    gender: string;
    aadharNumber: string;
    caste: string;
    samagraId: string;
    studentMobile: string;
    emailId: string;
    address: string;
    fatherName: string;
    motherName: string;
    fatherMobile: string;
    motherMobile: string;
    fatherOccupation: string;
    sessionId: string;
    studentClass: string;
    section: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    studentPic: string;
    fatherPic: string;
    motherPic: string;
    birthCertificate: string;
    sAadhar: string;
    fAadhar: string;
    mAadhar: string;
    casteCertificate: string;
    passbook: string;
    samagra: string;
    registeredAt: string;
};

const Details = () => {
    const router = useRouter();
    const [student, setStudent] = useState<StudentAllData | null>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<{ name: string; class: string; sId: string } | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchStdData = async () => {
        let userDataStr: string | null = null;
        if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
        else userDataStr = await SecureStore.getItemAsync("user_data");

        if (!userDataStr) {
            Toast.show({ type: "error", text1: "Error", text2: "User not found" });
            router.replace("/login");
            return;
        }

        const userData = JSON.parse(userDataStr);
        setUserData(userData);

        try {
            const res = await fetch(`${BACKEND_URL}/getStdData.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sId: userData.sId })
            });

            const data = await res.json();
            if (!data.error) setStudent(data.studentData);
            else Toast.show({ type: "error", text1: "No Data", text2: "Failed to fetch student data" });
        } catch {
            Toast.show({ type: "error", text1: "No Data", text2: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStdData(); }, []);

    if (!student || !userData || loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    const openModal = (url: string) => {
        setModalImageUrl(`${BACKEND_URL}/uploads/students/${userData.sId}/${url}`);
        setModalVisible(true);
    };

    const renderFileImage = (url: string | null, isCircle = false) => {
        if (!url) return <Text style={styles.naText}>N/A</Text>;
        return (
            <TouchableOpacity onPress={() => openModal(url)}>
                <Image source={{ uri: `${BACKEND_URL}/uploads/students/${userData.sId}/${url}` }} style={isCircle ? styles.circleImageSmall : styles.documentImageSmall} />
            </TouchableOpacity>
        );
    };

    const renderRow = (label: string, value: string | null) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value || "N/A"}</Text>
        </View>
    );

    return (
        <StdSidebarLayout headerTitle="Student Details">
            <ScrollView contentContainerStyle={styles.container}>
                {/* Modal for full-size image */}
                <Modal visible={modalVisible} transparent={true}>
                    <View style={styles.modalBackground}>
                        <TouchableOpacity style={styles.modalCloseArea} onPress={() => setModalVisible(false)} />
                        <Image source={{ uri: modalImageUrl! }} style={styles.modalImage} resizeMode="contain" />
                        <Button text="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </Modal>

                {/* Basic Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    {renderRow("Student ID", student.sId)}
                    {renderRow("Name", student.studentName)}
                    {renderRow("DOB", student.dob)}
                    {renderRow("Gender", student.gender)}
                    {renderRow("Mobile", student.studentMobile)}
                    {renderRow("Email", student.emailId)}
                    {renderRow("Address", student.address)}
                </View>

                {/* Parents Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Parents Details</Text>
                    {renderRow("Father Name", student.fatherName)}
                    {renderRow("Father Mobile", student.fatherMobile)}
                    {renderRow("Father Occupation", student.fatherOccupation)}
                    {renderRow("Mother Name", student.motherName)}
                    {renderRow("Mother Mobile", student.motherMobile)}
                </View>

                {/* Academic Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Academic Info</Text>
                    {renderRow("Class", student.studentClass)}
                    {renderRow("Section", student.section)}
                    {renderRow("Session ID", student.sessionId)}
                </View>

                {/* Bank Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bank Details</Text>
                    {renderRow("Account Number", student.accountNumber)}
                    {renderRow("Bank Name", student.bankName)}
                    {renderRow("Branch", student.branchName)}
                    {renderRow("IFSC Code", student.ifscCode)}
                </View>

                {/* Documents */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.docRow}><Text style={styles.label}>Student Photo:</Text>{renderFileImage(student.studentPic, true)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Father Photo:</Text>{renderFileImage(student.fatherPic, true)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Mother Photo:</Text>{renderFileImage(student.motherPic, true)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Birth Certificate:</Text>{renderFileImage(student.birthCertificate)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Student Aadhar:</Text>{renderFileImage(student.sAadhar)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Father Aadhar:</Text>{renderFileImage(student.fAadhar)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Mother Aadhar:</Text>{renderFileImage(student.mAadhar)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Caste Certificate:</Text>{renderFileImage(student.casteCertificate)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Passbook:</Text>{renderFileImage(student.passbook)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Samagra ID:</Text>{renderFileImage(student.samagra)}</View>
                    {renderRow("Registered At", student.registeredAt)}
                </View>
            </ScrollView>
        </StdSidebarLayout>
    );
};

export default Details;

const styles = StyleSheet.create({
    container: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#6B46C1", marginBottom: 12 },
    row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap" },
    docRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, flexWrap: "wrap" },
    label: { fontWeight: "600", width: 150, color: "#4A5568" },
    value: { flex: 1, color: "#2D3748" },
    naText: { color: "#A0AEC0" },
    circleImageSmall: { width: 50, height: 50, borderRadius: 25 },
    documentImageSmall: { width: 70, height: 50, borderRadius: 6 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
    modalCloseArea: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    modalImage: { width: "90%", height: "70%", borderRadius: 12 },
});
