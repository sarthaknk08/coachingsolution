import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const CoachingContext = createContext();

export function CoachingProvider({ children }) {
  const [coaching, setCoaching] = useState({
    coachingName: "Coaching CMS",
    coachingLogo: null,
    coachingDescription: "Manage Your Institute Efficiently",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    contactEmail: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachingConfig = async () => {
      try {
        const res = await API.get("/coaching/config");
        if (res.data.success) {
          setCoaching(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch coaching config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachingConfig();
  }, []);

  const updateCoachingConfig = (newConfig) => {
    setCoaching((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <CoachingContext.Provider value={{ coaching, loading, updateCoachingConfig }}>
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (!context) {
    throw new Error("useCoaching must be used within CoachingProvider");
  }
  return context;
}
