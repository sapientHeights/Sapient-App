import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../Button';
import NoDataSection from '../NoDataSection';

const { height } = Dimensions.get('window');

export type AttData = {
    sId: string;
    teacherName: string;
    studentName: string;
    sessionId: string;
    classId: string;
    section: string;
    classDate: string;
    att: string;
    markedBy: string;
}

type Props = {
    attData: AttData[];
    handleAttChange: (status: 'Present' | 'Absent' | 'Leave', sId: string) => void;
    saveAttData: () => void;
    noData: boolean;
    notMarked: boolean;
};

const AttendanceList: React.FC<Props> = ({ attData, handleAttChange, saveAttData, noData, notMarked }) => {
    const getStatusLabel = (attType: 'P' | 'A' | 'L') =>
        attType === 'P' ? 'Present' : attType === 'A' ? 'Absent' : 'Leave';

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Mark Attendance</Text>

            <View style={styles.listWrapper}>
                {noData ? (
                    <NoDataSection />
                ) : (
                    <FlatList
                        data={attData}
                        keyExtractor={(item) => item.sId}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item, index }) => (
                            <View style={[styles.card, index % 2 === 0 ? styles.cardEven : styles.cardOdd]}>
                                <Text style={styles.cardText}><Text style={styles.bold}>S.No:</Text> {index + 1}</Text>
                                <Text style={styles.cardText}><Text style={styles.bold}>ID:</Text> {item.sId}</Text>
                                <Text style={styles.cardText}><Text style={styles.bold}>Name:</Text> {item.studentName}</Text>

                                <View style={styles.attButtons}>
                                    {(['P', 'A', 'L'] as const).map((attType) => {
                                        return (
                                        <TouchableOpacity
                                            key={attType}
                                            style={[
                                                styles.attButton,
                                                item.att === attType
                                                    ? attType === 'P'
                                                        ? styles.presentButton
                                                        : attType === 'A'
                                                            ? styles.absentButton
                                                            : styles.leaveButton
                                                    : styles.defaultButton,
                                            ]}
                                            onPress={() => handleAttChange(getStatusLabel(attType), item.sId)}
                                        >
                                            <Text
                                                style={[
                                                    styles.attButtonText,
                                                    attType === 'L' ? { color: '#000' } : {},
                                                ]}
                                            >
                                                {getStatusLabel(attType)}
                                            </Text>
                                        </TouchableOpacity>
                                    )})}
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>

            {!noData && (
                <View style={styles.saveButtonContainer}>
                    <Button text={notMarked ? "Save Attendance" : "Update Attendance"} onPress={saveAttData} setGreen icon={null} />
                </View>
            )}
        </View>
    );
};

export default AttendanceList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 4,  
        paddingTop: 10,
        borderRadius: 10,
        width: "100%",     
        alignSelf: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginVertical: 10,
        color: '#111827',
    },
    listWrapper: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 0,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardEven: { backgroundColor: '#fefefe' },
    cardOdd: { backgroundColor: '#f9f9f9' },
    separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
    cardText: { fontSize: 14, marginBottom: 6 },
    bold: { fontWeight: '700' },
    attButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, gap: 2 },
    attButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    presentButton: { backgroundColor: '#16a34a' },
    absentButton: { backgroundColor: '#dc2626' },
    leaveButton: { backgroundColor: '#facc15' },
    defaultButton: { backgroundColor: '#e5e7eb' },
    attButtonText: { color: '#fff', fontWeight: '600' },
    saveButtonContainer: { marginTop: 10, marginBottom: 20, alignItems: 'center' },
});
