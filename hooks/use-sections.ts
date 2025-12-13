import { useEffect, useState } from "react";

export const useSections = (classId: string) => {
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchSectionsByClass = async () => {
        console.log("Class ID - " + classId);
        if (!classId) return;
        try {
            const res = await fetch(`${BACKEND_URL}/getSectionsByClass.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ classId }),
            });
            const data = await res.json();

            if (data.error) {
                setError("Failed to load sections");
            } else {
                const sections = data.sectionsData.map((item: { section: string }) => ({
                    id: item.section,
                    name: item.section,
                }));

                setSections(sections);
            }
        } catch (err) {
            setError("Some error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchSectionsByClass();
    }, [classId]);

    return { sections, isLoading, error };

}