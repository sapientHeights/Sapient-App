import { useEffect, useState } from "react";

export const useSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/getSessions.php`);
      const data = await res.json();

      if (data.error) {
        setError("Failed to load sessions");
      } else {
        const sessions = data.sessionsData.map((item: { sessionId: string }) => ({
            id: item.sessionId,
            name: item.sessionId,
        }));
        setSessions(sessions);

        const activeSess = data.sessionsData.filter((session: {sessionId: string, isActive: number}) => session.isActive === 1)[0].sessionId;
        setActiveSession(activeSess);
      }

    } catch (err) {
      setError("Some error occurred");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, activeSession, isLoading, error };
};
