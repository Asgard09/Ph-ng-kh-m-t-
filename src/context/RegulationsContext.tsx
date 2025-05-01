"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getRegulations, Regulations } from "@/utils/regulationsService";
import { medicalConfig } from "@/config";

interface RegulationsContextType {
  regulations: Regulations;
  loading: boolean;
  refreshRegulations: () => Promise<void>;
}

const defaultRegulations: Regulations = {
  maxPatientsPerDay: 40,
  consultationFee: medicalConfig.defaultConsultationFee,
};

const RegulationsContext = createContext<RegulationsContextType>({
  regulations: defaultRegulations,
  loading: true,
  refreshRegulations: async () => {},
});

export const useRegulations = () => useContext(RegulationsContext);

export const RegulationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [regulations, setRegulations] =
    useState<Regulations>(defaultRegulations);
  const [loading, setLoading] = useState(true);

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const data = await getRegulations();
      setRegulations(data);
    } catch (error) {
      console.error("Error fetching regulations:", error);
      setRegulations(defaultRegulations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  return (
    <RegulationsContext.Provider
      value={{
        regulations,
        loading,
        refreshRegulations: fetchRegulations,
      }}
    >
      {children}
    </RegulationsContext.Provider>
  );
};
