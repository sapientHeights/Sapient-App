import NoDataSection from "@/components/NoDataSection";
import StdSidebarLayout from "@/components/student/StdSidebarLayout";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

type StdData = {
    sId: string;
    name: string;
    emailId: string;
    session: string;
    class: string;
    section: string;
};

type StudentPaymentReport = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    remark: string;
    studentName: string;
};

type PaymentSubmission = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    transactionId: string;
    status: string;
}

const PayFee = () => {
    const router = useRouter();
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const initialStdData: StdData = {
        sId: "",
        name: "",
        emailId: "",
        session: "",
        class: "",
        section: ""
    };

    const [userData, setUserData] = useState<StdData>(initialStdData);
    const [loading, setLoading] = useState(true);
    const [feePaymentsData, setFeePaymentsData] = useState<StudentPaymentReport[]>([]);
    const [totalFee, setTotalFee] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [totalPending, setTotalPending] = useState(0);
    const [paymentsSubmission, setPaymentsSubmission] = useState<PaymentSubmission[]>([]);

    // Payment method
    const [selectedMethod, setSelectedMethod] = useState<"QR" | "UPI" | null>(null);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [enterAmount, setEnterAmount] = useState("");
    const [errorText, setErrorText] = useState("");
    const [txnId, setTxnId] = useState(""); // For verification
    const [submitPhase, setSubmitPhase] = useState(false); // Show txn input
    const [isPending, setIsPending] = useState(false);

    const qrRef = useRef<any>(null);

    const paymentMethods = [
        { name: "QR", icon: "grid" },
 //       { name: "UPI", icon: "smartphone" }
    ];

    // ---------------- Fetch Data ----------------
    const fetchStudentData = async () => {
        let userDataStr: string | null = null;
        if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
        else userDataStr = await SecureStore.getItemAsync("user_data");

        if (!userDataStr) {
            Toast.show({ type: "error", text1: "Error", text2: "User not found" });
            setLoading(false);
            router.replace({ pathname: "/login" });
            return;
        }

        const parsedUser = JSON.parse(userDataStr);
        setUserData(parsedUser);

        const stdData = {
            sessionId: parsedUser.session,
            classId: parsedUser.class,
            section: parsedUser.section,
            sId: parsedUser.sId
        };

        try {
            const paymentRes = await fetch(`${BACKEND_URL}/getStdPayments.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stdData })
            });
            const paymentData = await paymentRes.json();
            if (!paymentData.error) setFeePaymentsData(paymentData.paymentsData);

            const feeRes = await fetch(`${BACKEND_URL}/getStdFee.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stdData })
            });
            const feeDataResponse = await feeRes.json();

            if (!feeDataResponse.error) {
                const fee = feeDataResponse.feeData[0];
                const pending = fee.fee - fee.discount - fee.paid;

                setTotalFee(fee.fee);
                setDiscount(fee.discount);
                setTotalPending(pending);
            }

            const paymentSubRes = await fetch(`${BACKEND_URL}/getPaymentsSubmission.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: parsedUser.session, sId: parsedUser.sId, classId: parsedUser.class, section: parsedUser.section })
            });

            const subDataResponse = await paymentSubRes.json();
            if (!subDataResponse.error) {
                setPaymentsSubmission(subDataResponse.paymentsData);
                subDataResponse.paymentsData.forEach((data: PaymentSubmission) => {
                    if (data.status === 'Pending') {
                        setIsPending(true);
                        return;
                    }
                })
            }

        } catch (err) {
            Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    // ----------------- Handle Amount Change -----------------
    const handleAmountChange = (value: string) => {
        setEnterAmount(value);
        const num = Number(value);

        if (!value || num <= 0) {
            setErrorText("Enter a valid amount");
            return;
        }
        if (num > totalPending) {
            setErrorText("Amount cannot exceed pending amount");
            return;
        }
        setErrorText("");
    };

    // ----------------- UPI App Payment -----------------
    // const handleUPIPayment = () => {
    //     if (errorText || !enterAmount) return;

    //     const upiURL = encodeURI(
    //         `upi://pay?pa=sapientheightsintern.99982219@hdfcbank&pn=Sapient Heights School&tn=Fee Payment&am=${enterAmount}&cu=INR`
    //     );

    //     Linking.openURL(upiURL).catch(() => {
    //         Toast.show({ type: "error", text1: "No UPI app found" });
    //     });
    // };

    // const handleUPIPayment = async () => {
    //     if (errorText || !enterAmount) return;

    //     const upiURL =
    //         `upi://pay?pa=sapientheightsintern.99982219@hdfcbank` +
    //         `&pn=Sapient Heights School` +
    //         `&tn=Fee Payment` +
    //         `&am=${enterAmount}` +
    //         `&cu=INR`;

    //     try {
    //         const supported = await Linking.canOpenURL(upiURL);

    //         if (!supported) {
    //             Toast.show({
    //                 type: "error",
    //                 text1: "UPI App not found",
    //                 text2: "Please install a UPI app like GPay or PhonePe"
    //             });
    //             return;
    //         }

    //         await Linking.openURL(upiURL);
    //     } catch (err) {
    //         Toast.show({
    //             type: "error",
    //             text1: "Unable to open UPI app"
    //         });
    //     }
    // };

    const handleUPIPayment = async () => {
        if (errorText || !enterAmount) return;

        const upiURL = encodeURI(
            `upi://pay?pa=sapientheightsintern.99982219@hdfcbank` +
            `&pn=Sapient Heights School` +
            `&tn=Fee Payment` +
            `&am=${Number(enterAmount).toFixed(2)}` +
            `&cu=INR` +
            `&mode=02`
        );

        try {
            await Linking.openURL(upiURL);
        } catch (err) {
            Toast.show({
                type: "error",
                text1: "UPI App not found",
                text2: "Please install or enable a UPI app like GPay or PhonePe"
            });
        }
    };



    // ----------------- Open Modal -----------------
    const handlePay = () => {
        if (!selectedMethod) return;
        setModalVisible(true);
        setEnterAmount("");
        setErrorText("");
        setSubmitPhase(false);
        setTxnId("");
    };

    // ----------------- Submit Payment for Verification -----------------
    const submitPaymentVerification = async () => {
        if (!txnId) {
            setErrorText("Transaction ID is required");
            return;
        }
        setLoading(true);
        setModalVisible(false);

        const paymentData = {
            sessionId: userData.session,
            sId: userData.sId,
            classId: userData.class,
            section: userData.section,
            amount: enterAmount,
            paymentMode: "UPI",
            paymentDate: new Date().toLocaleDateString("en-CA"),
            transactionId: txnId
        }

        try {
            const res = await fetch(`${BACKEND_URL}/paymentSubmission.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentData
                })
            });
            const data = await res.json();
            if (!data.error) {
                Toast.show({ type: "success", text1: "Payment submitted", text2: "Awaiting admin verification" });
                fetchStudentData();
            } else {
                Toast.show({ type: "error", text1: "Error", text2: data.message || "Try again" });
                setModalVisible(true);
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
            setModalVisible(true);
        }
        finally {
            setLoading(false);
        }
    };

    const downloadQR = async () => {
        if (!qrRef.current) return;

        setLoading(true);
        try {
            if (Platform.OS === 'web') {
                qrRef.current.toDataURL((base64Data: string) => {
                    const dataURL = `data:image/png;base64,${base64Data}`;

                    fetch(dataURL)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'upi_qr.png';
                            link.click();
                            URL.revokeObjectURL(url);
                        });
                });
            } else {
                const uri = await captureRef(qrRef.current, {
                    format: 'png',
                    quality: 1,
                    result: 'tmpfile',
                });

                await Sharing.shareAsync(uri);
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Some error occurred", text2: "Failed to download image" });
            
        }
        finally{
            setLoading(false);
        }
    };

    if (loading)
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );

    return (
        <StdSidebarLayout headerTitle="Pay Fee">
            <ScrollView contentContainerStyle={styles.container}>
                {/* Student Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.studentName}>{userData.name}</Text>
                    <Text style={styles.studentDetails}>
                        {userData.class} • {userData.section} • {userData.sId}
                    </Text>
                </View>

                {/* Summary */}
                <View style={styles.feeSummaryContainer}>
                    <View style={styles.topRow}>
                        <View style={[styles.miniCard, { backgroundColor: "#FEF3C7" }]}>
                            <Text style={styles.miniLabel}>Total Fees</Text>
                            <Text style={styles.miniValue}>₹{totalFee}</Text>
                        </View>
                        <View style={[styles.miniCard, { backgroundColor: "#D1FAE5" }]}>
                            <Text style={styles.miniLabel}>Discount</Text>
                            <Text style={styles.miniValue}>₹{discount}</Text>
                        </View>
                    </View>
                    <View style={styles.totalCard}>
                        <Text style={styles.totalLabel}>Pending Amount</Text>
                        <Text style={styles.totalValue}>₹{totalPending}</Text>
                    </View>
                </View>

                {/* Payment History */}
                <View style={styles.feeBreakdown}>
                    <Text style={styles.sectionTitle}>Fee Payment History</Text>
                    {feePaymentsData.length > 0 ? (
                        <>
                            {feePaymentsData.map((fee, id) => (
                                <View key={id} style={styles.feeRow}>
                                    <Text style={styles.feeName}>
                                        {new Date(fee.paymentDate).toDateString()}
                                    </Text>
                                    <Text style={styles.feeAmount}>
                                        ₹{fee.amount} ({fee.paymentMode})
                                    </Text>
                                </View>
                            ))}
                            {/* Calculate the total */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalText}>Total Paid:</Text>
                                <Text style={styles.totalAmount}>
                                    ₹{feePaymentsData.reduce((acc, fee) => acc + Number(fee.amount), 0)}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <NoDataSection />
                    )}
                </View>


                {/* Payment Submissions */}
                <View style={styles.feeBreakdown}>
                    <Text style={styles.sectionTitle}>Payment Submissions</Text>
                    {paymentsSubmission.length > 0 ? (
                        paymentsSubmission.map((p, idx) => (
                            <View key={idx} style={styles.submissionCard}>
                                <View style={styles.submissionRow}>
                                    <Text style={styles.submissionLabel}>Amount:</Text>
                                    <Text style={styles.submissionValue}>₹{p.amount}</Text>
                                </View>
                                <View style={styles.submissionRow}>
                                    <Text style={styles.submissionLabel}>Transaction ID:</Text>
                                    <Text style={styles.submissionValue}>{p.transactionId}</Text>
                                </View>
                                <View style={styles.submissionRow}>
                                    <Text style={styles.submissionLabel}>Payment Date:</Text>
                                    <Text style={styles.submissionValue}>{p.paymentDate}</Text>
                                </View>
                                <View style={styles.submissionRow}>
                                    <Text style={styles.submissionLabel}>Status:</Text>
                                    <Text
                                        style={[
                                            styles.submissionValue,
                                            p.status === "Pending"
                                                ? { color: "#F97316" }
                                                : { color: "#EF4444" }
                                        ]}
                                    >
                                        {p.status}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <NoDataSection />
                    )}
                </View>

                {/* Payment Methods */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.methodRow}>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.name}
                                style={[
                                    styles.methodCard,
                                    isPending && { opacity: 0.5 },
                                    selectedMethod === method.name ? { borderColor: "#4F46E5" } : {}
                                ]}
                                onPress={() => setSelectedMethod(method.name as "QR" | "UPI")}
                                disabled={isPending}
                            >
                                <Feather
                                    name={method.icon as any}
                                    size={22}
                                    color={selectedMethod === method.name ? "#4F46E5" : "#475569"}
                                />
                                <Text style={styles.methodText}>{method.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Pay Now */}
                <TouchableOpacity
                    style={[styles.payButton, (!selectedMethod || isPending) && { opacity: 0.5 }]}
                    disabled={!selectedMethod || isPending}
                    onPress={handlePay}
                >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                    {isPending && (
                        <Text>Wait for Pending approvals</Text>
                    )}
                </TouchableOpacity>

                {/* Modal */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Enter Amount</Text>
                            <TextInput
                                value={enterAmount}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                                placeholder="Enter amount"
                                style={[
                                    styles.amountInput,
                                    submitPhase && { backgroundColor: "#E5E7EB", color: "#9CA3AF" }
                                ]}
                                editable={!submitPhase}
                            />
                            {errorText ? <Text style={{ color: "red", marginBottom: 10 }}>{errorText}</Text> : null}

                            {/* QR */}
                            {selectedMethod === "QR" && !submitPhase && !errorText && enterAmount ? (
                                <View style={{ marginVertical: 20, margin: 'auto' }}>
                                    <QRCode
                                        value={encodeURI(
                                            `upi://pay?pa=sapientheightsintern.99982219@hdfcbank&pn=Sapient Heights School&tn=Fee Payment&am=${enterAmount}&cu=INR`
                                        )}
                                        size={180}
                                        getRef={(c) => (qrRef.current = c)}
                                    />
                                </View>
                            ) : null}

                            {/* UPI button */}
                            {selectedMethod === "UPI" && !submitPhase && !errorText && enterAmount ? (
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]}
                                    onPress={handleUPIPayment}
                                    disabled={!!errorText}
                                >
                                    <Text style={styles.modalBtnText}>Pay via UPI App</Text>
                                </TouchableOpacity>
                            ) : null}

                            {selectedMethod === "QR" && !errorText && enterAmount && (
                                <TouchableOpacity onPress={downloadQR} style={[styles.modalBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} >
                                    <Text style={styles.modalBtnText}>Download QR</Text>
                                </TouchableOpacity>
                            )}

                            {/* I have paid button */}
                            {!submitPhase && enterAmount && !errorText ? (
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: "#10B981", marginTop: 10 }]}
                                    onPress={() => setSubmitPhase(true)}
                                >
                                    <Text style={styles.modalBtnText}>I have Paid</Text>
                                </TouchableOpacity>
                            ) : null}

                            {/* Transaction ID input */}
                            {submitPhase ? (
                                <>
                                    <TextInput
                                        value={txnId}
                                        onChangeText={setTxnId}
                                        placeholder="Enter Transaction ID"
                                        style={styles.amountInput}
                                    />
                                    <TouchableOpacity
                                        style={[styles.modalBtn, { backgroundColor: "#4F46E5" }]}
                                        onPress={submitPaymentVerification}
                                    >
                                        <Text style={styles.modalBtnText}>Submit for Verification</Text>
                                    </TouchableOpacity>
                                </>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </StdSidebarLayout>
    );
};

export default PayFee;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { padding: 20, paddingBottom: 40 },

    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2
    },
    studentName: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
    studentDetails: { marginTop: 4, color: "#6B7280" },

    feeSummaryContainer: { marginBottom: 20 },
    topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    miniCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 5,
        elevation: 2
    },
    miniLabel: { fontSize: 14, color: "#475569", marginBottom: 4 },
    miniValue: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },

    totalCard: {
        backgroundColor: "#E0E7FF",
        borderRadius: 16,
        padding: 20,
        alignItems: "center"
    },
    totalLabel: { fontSize: 16, color: "#4338CA" },
    totalValue: { fontSize: 28, fontWeight: "bold", color: "#1E293B", marginTop: 4 },

    feeBreakdown: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1E293B", marginBottom: 12 },
    feeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB"
    },

    submissionCard: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        elevation: 1
    },
    submissionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2
    },
    submissionLabel: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "500"
    },
    submissionValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E293B"
    },

    paymentSection: { marginBottom: 30 },
    methodRow: { flexDirection: "row", justifyContent: "space-between" },
    methodCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        marginHorizontal: 5
    },
    methodText: { marginLeft: 8, fontWeight: "600", fontSize: 16 },

    payButton: {
        backgroundColor: "#4F46E5",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 30
    },
    payButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20
    },
    modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
    amountInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10
    },
    modalBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10
    },
    modalBtnText: { color: "#fff", fontWeight: "600" },
    feeName: {
        fontSize: 14,
        color: "#1E293B",
        fontWeight: "500"
    },
    feeAmount: {
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "600"
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "mediumseagreen",
    },
    totalText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
    },
    totalAmount: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
    },

});
