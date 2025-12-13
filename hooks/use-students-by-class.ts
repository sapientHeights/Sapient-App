import { useEffect, useState } from "react";

type StudentData = {
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
};


export const useStudentsByClass = (session: string, classId: string, section: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studentsData, setStudentsData] = useState<StudentData[]>();
    const [studentsIdName, setStudentsIdName] = useState<[]>([]);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/getStudentsByClassData.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ session, class: classId, section }),
            });
            const data = await res.json();

            if (data.error) {
                setError("Failed to load Students");
                setStudentsIdName([]);
                setStudentsData([]);
            } else {
                setStudentsData(data.studentsData);
                const sortedData = data.studentsData.sort((a : StudentData, b : StudentData) => a.studentName.localeCompare(b.studentName));
                const studentsIdName = sortedData.map((item: { sId: string, studentName: string }) => ({
                    id: item.sId,
                    name: item.studentName,
                }));
                setStudentsIdName(studentsIdName);
            }
        } catch (err) {
            setError("Some error occurred");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if ((!session || session === "") || (!classId || classId === "") || (!section || section === "")) {
            setError("Class Data not available");
            setStudentsData([]);
            setStudentsIdName([]);
            setIsLoading(false);
            return;
        }

        fetchStudents();
    }, [session, classId, section]);

    return { studentsIdName, studentsData, isLoading, error };
};
