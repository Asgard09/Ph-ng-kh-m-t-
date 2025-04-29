import { dateConfig } from "@/config";

/**
 * Format a date to display format (DD/MM/YYYY)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(dateString);
  }
};

/**
 * Format a currency value
 * @param amount - Numeric amount to format
 * @returns Formatted currency string (e.g., 1.000.000 ₫)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Calculate age from date of birth
 * @param dob - Date of birth as ISO string
 * @returns Age in years
 */
export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Convert a date string to the API format (YYYY-MM-DD)
 * @param dateString - Date string in any format
 * @returns ISO format date string (YYYY-MM-DD)
 */
export const formatDateForAPI = (dateString: string | Date): string => {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toISOString().slice(0, 10);
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return "";
  }
};

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns Current date in ISO format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Get current month in format YYYY-MM
 * @returns Current month in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Validate a Vietnamese phone number
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^0\d{9}$/.test(phone);
};

/**
 * Generate a random ID
 * @returns Random ID string
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

/**
 * Sort an array of objects by a property
 * @param arr - Array to sort
 * @param prop - Property to sort by
 * @param ascending - Sort direction (true for ascending)
 * @returns Sorted array
 */
export const sortByProperty = <T>(
  arr: T[],
  prop: keyof T,
  ascending = true
): T[] => {
  return [...arr].sort((a, b) => {
    if (a[prop] < b[prop]) return ascending ? -1 : 1;
    if (a[prop] > b[prop]) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export default {
  formatDate,
  formatCurrency,
  calculateAge,
  formatDateForAPI,
  getCurrentDate,
  getCurrentMonth,
  truncateText,
  isValidPhoneNumber,
  generateId,
  sortByProperty,
  deepClone,
};
