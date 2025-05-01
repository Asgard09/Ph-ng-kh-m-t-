import { useRegulations } from "@/context/RegulationsContext";
import { Regulations } from "@/utils/regulationsService";
import { medicalConfig } from "@/config";

/**
 * A hook to get a specific regulation value with a fallback to default if loading
 * @param key The regulation key to get the value for
 * @param defaultValue Optional custom default value to use if loading
 * @returns The current value of the regulation
 */
export function useRegulationValue<K extends keyof Regulations>(
  key: K,
  defaultValue?: Regulations[K]
): Regulations[K] {
  const { regulations, loading } = useRegulations();

  if (loading) {
    // During loading, use either the provided default or the config default
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    // Fallback to medicalConfig defaults
    if (key === "consultationFee") {
      return medicalConfig.defaultConsultationFee as Regulations[K];
    }

    // For maxPatientsPerDay, use a reasonable default
    if (key === "maxPatientsPerDay") {
      return 40 as Regulations[K];
    }

    // Last resort fallback - should never get here if types are correct
    return regulations[key];
  }

  // Once loaded, return the actual value
  return regulations[key];
}
