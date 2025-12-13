import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Toast from 'react-native-toast-message';

type ClassTeacherData = {
    sessionId: string;
    classId: string;
    section: string;
    subjectId: string;
    tId: string;
}


export const useTeacherClasses = (sessionId: string) => {
    const [classes, setClasses] = useState<[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teacherClassesData, setTeacherClassesData] = useState<ClassTeacherData[]>();

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchClasses = async () => {
        let userDataStr: string | null = null;

        if (Platform.OS === "web") userDataStr = localStorage.getItem("user_data");
        else userDataStr = await SecureStore.getItemAsync("user_data");

        if (userDataStr === null) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Some error occurred' });
            return null;
        }

        let userData = JSON.parse(userDataStr);
        const tId = userData.tId;

        try {
            const res = await fetch(`${BACKEND_URL}/getTeacherClasses.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tId, sessionId }),
            });
            const data = await res.json();

            if (data.error) {
                setError("Failed to load classes");
                setClasses([]);
                setTeacherClassesData([]);
            } else {
                setTeacherClassesData(data.tClassesData);
                const classes = data.tClassesData.map((item: { classId: string }) => ({
                    id: item.classId,
                    name: item.classId,
                }));
                const sections = data.tClassesData.map((item: { section: string }) => ({
                    id: item.section,
                    name: item.section,
                }));
                setClasses(classes);
            }
        } catch (err) {
            setError("Some error occurred");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!sessionId || sessionId === "") {
            setError("Session not available");
            setClasses([]);
            setTeacherClassesData([]);
            setIsLoading(false);
            return;
        }

        fetchClasses();
    }, [sessionId]);

    return { classes, teacherClassesData, isLoading, error };
};
