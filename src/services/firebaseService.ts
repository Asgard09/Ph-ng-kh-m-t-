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
  Firestore,
  DocumentData,
} from "firebase/firestore";

// Collection references
const COLLECTIONS = {
  PATIENTS: "patients",
  EXAMINATIONS: "examinations",
  INVOICES: "invoices",
  MEDICINES: "medicines",
} as const;

// Base interface for timestamps
interface TimestampFields {
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// Patient interface
export interface Patient extends Partial<TimestampFields> {
  id?: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  registrationTime?: string;
  registrationDate?: string;
  status?: string; // 'waiting' (default) or 'processed'
}

// Examination interface
export interface Examination extends Partial<TimestampFields> {
  id?: string;
  patientId: string;
  patientName: string;
  examDate: string;
  symptoms: string;
  diagnosis: string;
  medicines: Medicine[];
}

// Medicine interface
export interface Medicine extends Partial<TimestampFields> {
  id?: string;
  name: string;
  unit: string;
  quantity: number;
  usage?: string;
  expiryDate?: string;
  pharmacy?: string;
  price?: number;
}

// Invoice interface
export interface Invoice extends Partial<TimestampFields> {
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
 * Get patients by registration date
 * @param date - Registration date
 * @returns Array of patients
 */
export const getPatientsByDate = async (date: string): Promise<Patient[]> => {
  try {
    console.log("Getting patients for date:", date);

    // Query patients by registration date
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("registrationDate", "==", date)
    );

    const querySnapshot = await getDocs(q);
    console.log("Query snapshot size:", querySnapshot.size);

    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Chỉ hiển thị bệnh nhân đang chờ khám (status là 'waiting' hoặc không có status)
      const patientStatus = data.status || "waiting";
      if (patientStatus === "waiting") {
        patients.push({
          id: doc.id,
          name: data.name,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          address: data.address || "",
          phoneNumber: data.phoneNumber,
          registrationTime: data.registrationTime,
          registrationDate: data.registrationDate,
          status: patientStatus,
        });
      }
    });

    return patients;
  } catch (error) {
    console.error("Error getting patients by date:", error);
    return [];
  }
};

/**
 * Get all patients for a specific date regardless of status
 * @param date - Registration date
 * @returns Array of patients
 */
export const getAllPatientsByDate = async (
  date: string
): Promise<Patient[]> => {
  try {
    console.log("Getting all patients for date:", date);

    // Query patients by registration date
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("registrationDate", "==", date)
    );

    const querySnapshot = await getDocs(q);
    console.log("Query snapshot size:", querySnapshot.size);

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
        status: data.status || "waiting",
      });
    });

    return patients;
  } catch (error) {
    console.error("Error getting all patients by date:", error);
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
 * Update a patient's status (e.g., to mark them as processed after invoicing)
 * @param patientId - Patient ID
 * @param registrationDate - Registration date
 * @param status - New status ('waiting' or 'processed')
 * @returns True if successful
 */
export const updatePatientStatus = async (
  patientId: string,
  registrationDate: string,
  status: string
): Promise<boolean> => {
  try {
    console.log(
      `Updating patient ${patientId} status to ${status} for date ${registrationDate}`
    );

    // Truy cập trực tiếp document theo ID
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      console.log(`Không tìm thấy bệnh nhân với ID ${patientId}`);
      return false;
    }

    // Cập nhật trạng thái
    await updateDoc(patientRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    console.log(
      `Đã cập nhật trạng thái bệnh nhân ${patientId} thành ${status}`
    );
    return true;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái bệnh nhân:`, error);
    return false;
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
 * Remove patient from waiting list after invoice creation
 * @param patientId - Patient ID
 * @param registrationDate - Registration date
 * @returns True if successful
 */
export const removePatientFromWaitingList = async (
  patientId: string,
  registrationDate: string
): Promise<boolean> => {
  try {
    console.log(
      `Removing patient ${patientId} from waiting list for date ${registrationDate}`
    );

    // Không thể truy vấn trực tiếp theo ID document, nên sẽ lấy theo ngày rồi lọc
    const patientsQuery = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("registrationDate", "==", registrationDate)
    );

    const querySnapshot = await getDocs(patientsQuery);

    if (querySnapshot.empty) {
      console.log(
        "Không tìm thấy bệnh nhân nào trong danh sách chờ khám cho ngày này"
      );
      return false;
    }

    let patientFound = false;

    // Tìm document có ID khớp với patientId
    querySnapshot.forEach((doc) => {
      if (doc.id === patientId) {
        // Tìm thấy bệnh nhân, xóa document
        deleteDoc(doc.ref);
        patientFound = true;
        console.log(`Đã xóa bệnh nhân ${patientId} khỏi danh sách chờ khám`);
      }
    });

    return patientFound;
  } catch (error) {
    console.error("Lỗi khi xóa bệnh nhân khỏi danh sách chờ khám:", error);
    return false;
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

/**
 * MEDICINE MANAGEMENT FUNCTIONS
 */

/**
 * Add a new medicine
 * @param medicineData - Medicine data
 * @returns Medicine ID
 */
export const addMedicine = async (
  medicineData: Omit<Medicine, "id">
): Promise<string> => {
  try {
    const medicineWithTimestamp = {
      ...medicineData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.MEDICINES),
      medicineWithTimestamp
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw new Error("Failed to add medicine");
  }
};

/**
 * Get all medicines
 * @returns Array of medicines
 */
export const getAllMedicines = async (): Promise<Medicine[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.MEDICINES));

    const medicines: Medicine[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      medicines.push({
        id: doc.id,
        name: data.name,
        unit: data.unit,
        quantity: Number(data.quantity) || 0,
        usage: data.usage || "",
        expiryDate: data.expiryDate || "",
        pharmacy: data.pharmacy || "",
        price: Number(data.price) || 0,
      });
    });

    return medicines;
  } catch (error) {
    console.error("Error getting all medicines:", error);
    return [];
  }
};

/**
 * Update a medicine
 * @param id - Medicine ID
 * @param medicineData - Updated medicine data
 * @returns True if successful
 */
export const updateMedicine = async (
  id: string,
  medicineData: Partial<Medicine>
): Promise<boolean> => {
  try {
    const medicineRef = doc(db, COLLECTIONS.MEDICINES, id);

    // Add updated timestamp
    const dataWithTimestamp = {
      ...medicineData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(medicineRef, dataWithTimestamp);
    return true;
  } catch (error) {
    console.error("Error updating medicine:", error);
    return false;
  }
};

/**
 * Delete a medicine
 * @param id - Medicine ID
 * @returns True if successful
 */
export const deleteMedicine = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEDICINES, id));
    return true;
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return false;
  }
};

/**
 * Get a medicine by ID
 * @param id - Medicine ID
 * @returns Medicine object or null if not found
 */
export const getMedicineById = async (id: string): Promise<Medicine | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEDICINES, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        unit: data.unit,
        quantity: Number(data.quantity) || 0,
        usage: data.usage || "",
        expiryDate: data.expiryDate || "",
        pharmacy: data.pharmacy || "",
        price: Number(data.price) || 0,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting medicine:", error);
    return null;
  }
};

export default {
  // Patient functions
  addPatient,
  getPatientsByDate,
  getAllPatientsByDate,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  updatePatientStatus,

  // Examination functions
  addExamination,
  getExaminationsByPatient,
  getAllExaminations,

  // Invoice functions
  addInvoice,
  getInvoicesByPatient,
  updateInvoicePayment,
  getAllInvoices,
  removePatientFromWaitingList,

  // Medicine functions
  addMedicine,
  getAllMedicines,
  updateMedicine,
  deleteMedicine,
  getMedicineById,

  // New function
  getAllPatients,
};
