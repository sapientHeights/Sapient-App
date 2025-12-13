import Button from "@/components/Button";
import SidebarLayout from "@/components/teacher/SidebarLayout";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type TeacherAllData = {
    tId: string;
    teacherName: string;
    dob: string;
    gender: string;
    aadharNumber: string;
    caste: string;
    maritalStatus: string;
    samagraId: string;
    teacherMobile: string;
    emailId: string;
    bloodGroup: string;
    religion: string;
    panNumber: string;
    address: string;
    fatherName: string;
    motherName: string;
    spouseName: string;
    qualification: string;
    experience: string;
    empId: string;
    designation: string;
    doj: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    teacherPic: string;
    panCard: string;
    tAadhar: string;
    casteCertificate: string;
    passbook: string;
    samagra: string;
};

const TeacherDetails = () => {
    const router = useRouter();
    const [teacher, setTeacher] = useState<TeacherAllData | null>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<{ name: string; tId: string } | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchTeacherData = async () => {
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
            const res = await fetch(`${BACKEND_URL}/getTeacherData.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tId: userData.tId })
            });

            const data = await res.json();
            if (!data.error) setTeacher(data.teacherData);
            else Toast.show({ type: "error", text1: "No Data", text2: "Failed to fetch teacher data" });
        } catch {
            Toast.show({ type: "error", text1: "No Data", text2: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeacherData(); }, []);

    if (!teacher || !userData || loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    const openModal = (url: string) => {
        setModalImageUrl(`${BACKEND_URL}/uploads/teachers/${userData.tId}/${url}`);
        setModalVisible(true);
    };

    const renderFileImage = (url: string | null, isCircle = false) => {
        if (!url) return <Text style={styles.naText}>N/A</Text>;
        return (
            <TouchableOpacity onPress={() => openModal(url)}>
                <Image source={{ uri: `${BACKEND_URL}/uploads/teachers/${userData.tId}/${url}` }} style={isCircle ? styles.circleImageSmall : styles.documentImageSmall} />
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
        <SidebarLayout headerTitle="Teacher Details">
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
                    {renderRow("Teacher ID", teacher.tId)}
                    {renderRow("Name", teacher.teacherName)}
                    {renderRow("DOB", teacher.dob)}
                    {renderRow("Gender", teacher.gender)}
                    {renderRow("Mobile", teacher.teacherMobile)}
                    {renderRow("Email", teacher.emailId)}
                    {renderRow("Blood Group", teacher.bloodGroup)}
                    {renderRow("Religion", teacher.religion)}
                    {renderRow("Marital Status", teacher.maritalStatus)}
                    {renderRow("Address", teacher.address)}
                </View>

                {/* Family Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Family Details</Text>
                    {renderRow("Father Name", teacher.fatherName)}
                    {renderRow("Mother Name", teacher.motherName)}
                    {renderRow("Spouse Name", teacher.spouseName)}
                </View>

                {/* Academic & Professional Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Professional Info</Text>
                    {renderRow("Qualification", teacher.qualification)}
                    {renderRow("Experience", teacher.experience)}
                    {renderRow("Emp ID", teacher.empId)}
                    {renderRow("Designation", teacher.designation)}
                    {renderRow("Date of Joining", teacher.doj)}
                </View>

                {/* Bank Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bank Details</Text>
                    {renderRow("Account Number", teacher.accountNumber)}
                    {renderRow("Bank Name", teacher.bankName)}
                    {renderRow("Branch", teacher.branchName)}
                    {renderRow("IFSC Code", teacher.ifscCode)}
                </View>

                {/* Documents */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.docRow}><Text style={styles.label}>Teacher Photo:</Text>{renderFileImage(teacher.teacherPic, true)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Pan Card:</Text>{renderFileImage(teacher.panCard)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Aadhar:</Text>{renderFileImage(teacher.tAadhar)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Caste Certificate:</Text>{renderFileImage(teacher.casteCertificate)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Passbook:</Text>{renderFileImage(teacher.passbook)}</View>
                    <View style={styles.docRow}><Text style={styles.label}>Samagra ID:</Text>{renderFileImage(teacher.samagra)}</View>
                </View>
            </ScrollView>
        </SidebarLayout>
    );
};

export default TeacherDetails;

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
