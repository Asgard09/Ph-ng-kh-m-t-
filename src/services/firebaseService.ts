import { db } from "@/firebase/config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// Collection references
const COLLECTIONS = {
  PATIENTS: "patients",
  EXAMINATIONS: "examinations",
  INVOICES: "invoices",
  MEDICINES: "medicines",
};

// Patient interface
export interface Patient {
  id?: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  registrationTime?: string;
  registrationDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Examination interface
export interface Examination {
  id?: string;
  patientId: string;
  patientName: string;
  examDate: string;
  symptoms: string;
  diagnosis: string;
  medicines: Medicine[];
  createdAt?: any;
  updatedAt?: any;
}

// Medicine interface
export interface Medicine {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  usage: string;
}

// Invoice interface
export interface Invoice {
  id?: string;
  patientId: string;
  patientName: string;
  examDate: string;
  consultationFee: number;
  medicineFee: number;
  otherFees: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentMethod?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * PATIENT MANAGEMENT FUNCTIONS
 */

/**
 * Add a new patient to the database
 * @param patientData - Patient data object
 * @returns Patient ID
 */
export const addPatient = async (
  patientData: Omit<Patient, "id">
): Promise<string> => {
  try {
    console.log("Adding patient with data:", patientData);

    // Format current date and time for registration if not provided
    const now = new Date();
    const registrationDate =
      patientData.registrationDate || now.toISOString().slice(0, 10);
    const registrationTime =
      patientData.registrationTime || now.toLocaleTimeString("vi-VN");

    // Prepare data for Firestore
    const patientWithTimestamp = {
      ...patientData,
      registrationDate,
      registrationTime,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Data prepared for Firestore:", {
      ...patientWithTimestamp,
      createdAt: "serverTimestamp()", // For logging only
      updatedAt: "serverTimestamp()", // For logging only
    });

    // Add document to Firestore
    const docRef = await addDoc(
      collection(db, COLLECTIONS.PATIENTS),
      patientWithTimestamp
    );
    console.log("Patient added with ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw new Error("Failed to add patient to database");
  }
};

/**
 * Get all patients for a specific date
 * @param date - Date string in format YYYY-MM-DD
 * @returns Array of patients
 */
export const getPatientsByDate = async (date: string): Promise<Patient[]> => {
  try {
    console.log("getPatientsByDate called with date:", date);

    // Query patients for the specific date
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("registrationDate", "==", date)
    );

    console.log("Executing Firestore query for date:", date);
    const querySnapshot = await getDocs(q);
    console.log("Query executed, found patients:", querySnapshot.size);

    // Map results to Patient objects
    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      patients.push({
        id: doc.id,
        name: data.name,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address || "",
        phoneNumber: data.phoneNumber,
        registrationTime: data.registrationTime,
        registrationDate: data.registrationDate,
      });
    });

    console.log("Patients for date", date, ":", patients.length);
    return patients;
  } catch (error) {
    console.error("Error getting patients:", error);
    return [];
  }
};

/**
 * Get a patient by ID
 * @param id - Patient ID
 * @returns Patient object or null if not found
 */
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.PATIENTS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address || "",
        phoneNumber: data.phoneNumber,
        registrationTime: data.registrationTime,
        registrationDate: data.registrationDate,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting patient:", error);
    return null;
  }
};

/**
 * Update a patient's information
 * @param id - Patient ID
 * @param patientData - Updated patient data
 * @returns True if successful
 */
export const updatePatient = async (
  id: string,
  patientData: Partial<Patient>
): Promise<boolean> => {
  try {
    const patientRef = doc(db, COLLECTIONS.PATIENTS, id);

    // Add updated timestamp
    const dataWithTimestamp = {
      ...patientData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(patientRef, dataWithTimestamp);
    return true;
  } catch (error) {
    console.error("Error updating patient:", error);
    return false;
  }
};

/**
 * Delete a patient
 * @param id - Patient ID
 * @returns True if successful
 */
export const deletePatient = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PATIENTS, id));
    return true;
  } catch (error) {
    console.error("Error deleting patient:", error);
    return false;
  }
};

/**
 * Search patients by name or phone number
 * @param searchTerm - Search term
 * @returns Array of matching patients
 */
export const searchPatients = async (
  searchTerm: string
): Promise<Patient[]> => {
  try {
    // Get all patients (in a real app, you would implement a proper server-side search)
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PATIENTS));

    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Check if name or phone contains the search term
      if (
        data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.phoneNumber.includes(searchTerm)
      ) {
        patients.push({
          id: doc.id,
          name: data.name,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          address: data.address || "",
          phoneNumber: data.phoneNumber,
          registrationTime: data.registrationTime,
          registrationDate: data.registrationDate,
        });
      }
    });

    return patients;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
};

/**
 * EXAMINATION MANAGEMENT FUNCTIONS
 */

/**
 * Add a new examination record
 * @param examinationData - Examination data
 * @returns Examination ID
 */
export const addExamination = async (
  examinationData: Omit<Examination, "id">
): Promise<string> => {
  try {
    const examinationWithTimestamp = {
      ...examinationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.EXAMINATIONS),
      examinationWithTimestamp
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding examination:", error);
    throw new Error("Failed to add examination record");
  }
};

/**
 * Get examination records for a patient
 * @param patientId - Patient ID
 * @returns Array of examination records
 */
export const getExaminationsByPatient = async (
  patientId: string
): Promise<Examination[]> => {
  try {
    // Chỉ sử dụng where, không sử dụng orderBy để tránh yêu cầu composite index
    const q = query(
      collection(db, COLLECTIONS.EXAMINATIONS),
      where("patientId", "==", patientId)
    );

    const querySnapshot = await getDocs(q);

    const examinations: Examination[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      examinations.push({
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        examDate: data.examDate,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        medicines: data.medicines || [],
      });
    });

    // Sắp xếp kết quả ở phía client thay vì ở Firestore
    examinations.sort((a, b) => {
      // Sắp xếp theo ngày khám, giảm dần (mới nhất trước)
      return new Date(b.examDate).getTime() - new Date(a.examDate).getTime();
    });

    return examinations;
  } catch (error) {
    console.error("Error getting examinations:", error);
    return [];
  }
};

/**
 * Get all examination records
 * @returns Array of examination records
 */
export const getAllExaminations = async (): Promise<Examination[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, COLLECTIONS.EXAMINATIONS)
    );

    const examinations: Examination[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      examinations.push({
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        examDate: data.examDate,
        symptoms: data.symptoms || "",
        diagnosis: data.diagnosis,
        medicines: data.medicines || [],
      });
    });

    return examinations;
  } catch (error) {
    console.error("Error getting all examinations:", error);
    return [];
  }
};

/**
 * INVOICE MANAGEMENT FUNCTIONS
 */

/**
 * Add a new invoice
 * @param invoiceData - Invoice data
 * @returns Invoice ID
 */
export const addInvoice = async (
  invoiceData: Omit<Invoice, "id">
): Promise<string> => {
  try {
    const invoiceWithTimestamp = {
      ...invoiceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.INVOICES),
      invoiceWithTimestamp
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding invoice:", error);
    throw new Error("Failed to add invoice");
  }
};

/**
 * Get invoices for a patient
 * @param patientId - Patient ID
 * @returns Array of invoices
 */
export const getInvoicesByPatient = async (
  patientId: string
): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.INVOICES),
      where("patientId", "==", patientId),
      orderBy("examDate", "desc")
    );

    const querySnapshot = await getDocs(q);

    const invoices: Invoice[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        examDate: data.examDate,
        consultationFee: data.consultationFee,
        medicineFee: data.medicineFee,
        otherFees: data.otherFees || 0,
        totalAmount: data.totalAmount,
        isPaid: data.isPaid,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
      });
    });

    return invoices;
  } catch (error) {
    console.error("Error getting invoices:", error);
    return [];
  }
};

/**
 * Update invoice payment status
 * @param id - Invoice ID
 * @param isPaid - Payment status
 * @param paymentMethod - Payment method
 * @returns True if successful
 */
export const updateInvoicePayment = async (
  id: string,
  isPaid: boolean,
  paymentMethod: string
): Promise<boolean> => {
  try {
    const invoiceRef = doc(db, COLLECTIONS.INVOICES, id);

    await updateDoc(invoiceRef, {
      isPaid,
      paymentDate: isPaid ? new Date().toISOString().slice(0, 10) : null,
      paymentMethod: isPaid ? paymentMethod : null,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating invoice payment:", error);
    return false;
  }
};

/**
 * Get all invoices
 * @returns Array of invoices
 */
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.INVOICES));

    const invoices: Invoice[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        id: doc.id,
        patientId: data.patientId || "",
        patientName: data.patientName || "",
        examDate: data.examDate || "",
        consultationFee: Number(data.consultationFee) || 0,
        medicineFee: Number(data.medicineFee) || 0,
        otherFees: Number(data.otherFees) || 0,
        totalAmount: Number(data.totalAmount) || 0,
        isPaid: Boolean(data.isPaid) || false,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
      });
    });

    return invoices;
  } catch (error) {
    console.error("Error getting all invoices:", error);
    return [];
  }
};

/**
 * Get all patients
 * @returns Array of patients
 */
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PATIENTS));

    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      patients.push({
        id: doc.id,
        name: data.name,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
        registrationTime: data.registrationTime,
        registrationDate: data.registrationDate,
      });
    });

    return patients;
  } catch (error) {
    console.error("Error getting all patients:", error);
    return [];
  }
};

export default {
  // Patient functions
  addPatient,
  getPatientsByDate,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,

  // Examination functions
  addExamination,
  getExaminationsByPatient,
  getAllExaminations,

  // Invoice functions
  addInvoice,
  getInvoicesByPatient,
  updateInvoicePayment,
  getAllInvoices,

  // New function
  getAllPatients,
};
