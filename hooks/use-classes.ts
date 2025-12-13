import { useEffect, useState } from "react";

export const useClasses = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/getClasses.php`);
            const data = await res.json();

            if (data.error) {
                setError("Failed to load classes");
            } else {
                const classes = data.classesData.map((item: { classId: string }) => ({
                    id: item.classId,
                    name: item.classId,
                }));
                setClasses(classes);
            }

        } catch (err) {
            setError("Some error occurred");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    return { classes, isLoading, error };
}