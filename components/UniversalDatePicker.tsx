import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    value: Date;
    onChange: (date: Date) => void;
}

const UniversalDatePicker: React.FC<Props> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [showPicker, setShowPicker] = useState(false); // for mobile custom date

    const format = (d: Date) => d.toLocaleDateString("en-CA");

    /* ---------------- WEB VERSION ---------------- */
    if (Platform.OS === "web") {
        return (
            <input
                type="date"
                value={format(value)}
                onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    onChange(newDate);
                }}
                style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: 16,
                }}
            />
        );
    }

    /* ---------------- MOBILE VERSION ---------------- */
    return (
        <View>
            {/* Display selected date */}
            <TouchableOpacity
                style={styles.mobileInput}
                onPress={() => setOpen(true)}
            >
                <Text style={styles.mobileText}>{value.toDateString()}</Text>
            </TouchableOpacity>

            {/* Manual date chooser sheet */}
            {open && (
                <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>Select Date</Text>

                    {/* Today */}
                    <TouchableOpacity
                        onPress={() => {
                            onChange(new Date());
                            setOpen(false);
                        }}
                        style={styles.option}
                    >
                        <Text>Today</Text>
                    </TouchableOpacity>

                    {/* Yesterday */}
                    <TouchableOpacity
                        onPress={() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            onChange(d);
                            setOpen(false);
                        }}
                        style={styles.option}
                    >
                        <Text>Yesterday</Text>
                    </TouchableOpacity>

                    {/* Tomorrow */}
                    <TouchableOpacity
                        onPress={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            onChange(d);
                            setOpen(false);
                        }}
                        style={styles.option}
                    >
                        <Text>Tomorrow</Text>
                    </TouchableOpacity>

                    {/* CUSTOM DATE - native mobile picker */}
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        style={styles.option}
                    >
                        <Text>Custom Date</Text>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity
                        onPress={() => setOpen(false)}
                        style={[styles.option, { backgroundColor: "#fee2e2" }]}
                    >
                        <Text style={{ color: "#b91c1c" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Native Date Picker */}
            {showPicker && (
                <DateTimePicker
                    value={value}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) {
                            onChange(selectedDate);
                            setOpen(false);
                        }
                    }}
                />
            )}
        </View>
    );
};

export default UniversalDatePicker;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    mobileInput: {
        backgroundColor: "#EEF2FF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    mobileText: {
        fontSize: 16,
        color: "#1E293B",
        fontWeight: "600",
    },
    sheet: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 3,
    },
    sheetTitle: {
        fontWeight: "700",
        marginBottom: 10,
        fontSize: 16,
        textAlign: "center",
    },
    option: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#f3f4f6",
    },
});
