// Application-wide configuration settings

// Firebase configuration
export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyB0pETLPAvxHetoYb9dbavsVJ-kYqxzVkE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "gplx-580ed.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gplx-580ed",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "gplx-580ed.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "544586253762",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:544586253762:web:766008e91436c4d25bc25b",
};

// Medical module configuration
export const medicalConfig = {
  // Default consultation fee
  defaultConsultationFee: 150000,

  // Supported payment methods
  paymentMethods: ["Tiền mặt", "Chuyển khoản", "Thẻ tín dụng"],

  // Medicine units
  medicineUnits: ["Viên", "Ống", "Chai", "Gói", "Vỉ"],

  // Common diagnoses for quick selection
  commonDiagnoses: [
    "Viêm họng",
    "Cảm cúm",
    "Đau dạ dày",
    "Viêm xoang",
    "Viêm phế quản",
    "Đau đầu",
    "Tiêu chảy",
  ],

  // Common medicines
  commonMedicines: [
    {
      name: "Paracetamol",
      unit: "Viên",
      defaultUsage: "Uống 1 viên sau khi ăn, ngày 3 lần",
    },
    {
      name: "Amoxicillin",
      unit: "Viên",
      defaultUsage: "Uống 1 viên sau khi ăn, ngày 2 lần",
    },
    {
      name: "Cetirizine",
      unit: "Viên",
      defaultUsage: "Uống 1 viên sau khi ăn tối",
    },
    {
      name: "Omeprazole",
      unit: "Viên",
      defaultUsage: "Uống 1 viên trước khi ăn sáng",
    },
    {
      name: "Vitamin C",
      unit: "Viên",
      defaultUsage: "Uống 1 viên sau khi ăn, ngày 1 lần",
    },
  ],

  // Medicine default quantity
  defaultMedicineQuantity: 10,
};

// Application theme configuration
export const themeConfig = {
  primaryColor: "#3B82F6", // blue-500
  secondaryColor: "#10B981", // green-500
  errorColor: "#EF4444", // red-500
  warningColor: "#F59E0B", // amber-500
  successColor: "#10B981", // green-500
  infoColor: "#3B82F6", // blue-500
};

// Date format settings
export const dateConfig = {
  displayFormat: "dd/MM/yyyy",
  apiFormat: "yyyy-MM-dd",
};

// System settings
export const systemConfig = {
  applicationName: "Phần mềm Quản lý Phòng khám",
  version: "1.0.0",
  supportEmail: "support@example.com",
  supportPhone: "0123456789",
  pageSize: 10, // Default number of items per page in tables
};

// Validation settings
export const validationConfig = {
  phoneRegex: /^0\d{9}$/,
  emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  idCardRegex: /^\d{12}$/,
};

// Export all configurations as a single object
export default {
  firebase: firebaseConfig,
  medical: medicalConfig,
  theme: themeConfig,
  dateFormat: dateConfig,
  system: systemConfig,
  validation: validationConfig,
};
