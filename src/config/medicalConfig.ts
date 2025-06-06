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
    "Viêm khớp dạng thấp",
    "Gai cột sống",
    "Thoát vị đĩa đệm",
    "Gãy xương",
    "Viêm khớp vảy nến",
    "Gout",
    "Viêm bao gân",
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

export default medicalConfig;
