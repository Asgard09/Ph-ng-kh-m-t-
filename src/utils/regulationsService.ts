import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { medicalConfig } from "@/config";

export interface Regulations {
  maxPatientsPerDay: number;
  consultationFee: number;
}

const defaultRegulations: Regulations = {
  maxPatientsPerDay: 40,
  consultationFee: medicalConfig.defaultConsultationFee,
};

/**
 * Get the current regulations from Firestore
 * If no regulations exist, returns default values
 */
export const getRegulations = async (): Promise<Regulations> => {
  try {
    const regulationsDoc = await getDoc(doc(db, "settings", "regulations"));

    if (regulationsDoc.exists()) {
      return regulationsDoc.data() as Regulations;
    }

    // If no regulations exist yet, initialize with defaults
    await setDoc(doc(db, "settings", "regulations"), defaultRegulations);
    return defaultRegulations;
  } catch (error) {
    console.error("Error fetching regulations:", error);
    return defaultRegulations;
  }
};

/**
 * Update regulations in Firestore
 */
export const updateRegulations = async (
  regulations: Regulations
): Promise<boolean> => {
  try {
    await setDoc(doc(db, "settings", "regulations"), regulations);
    return true;
  } catch (error) {
    console.error("Error updating regulations:", error);
    return false;
  }
};

/**
 * Get the maximum number of patients allowed per day
 */
export const getMaxPatientsPerDay = async (): Promise<number> => {
  const regulations = await getRegulations();
  return regulations.maxPatientsPerDay;
};

/**
 * Get the current consultation fee
 */
export const getConsultationFee = async (): Promise<number> => {
  const regulations = await getRegulations();
  return regulations.consultationFee;
};
