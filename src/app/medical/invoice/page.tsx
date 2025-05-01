"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaSave,
  FaSpinner,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { medicalConfig } from "@/config";
import * as firebaseService from "@/services/firebaseService";
import type { Patient, Examination } from "@/services/firebaseService";
import { useRegulationValue } from "@/hooks/useRegulationValue";

// Sample price mapping - this would come from your database in a real app
const commonMedicinePrices: Record<string, number> = {
  Paracetamol: 5000,
  Amoxicillin: 15000,
  Cetirizine: 12000,
  Omeprazole: 18000,
  Mebeverine: 20000,
  Ibuprofen: 8000,
  Loratadine: 12000,
  "Vitamin C": 10000,
  "Vitamin B Complex": 15000,
  Metformin: 7000,
};

interface Invoice {
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

export default function InvoicePage() {
  // Get consultation fee from regulations using our custom hook
  const consultationFee = useRegulationValue("consultationFee");

  // State for patients with examinations
  const [patientsWithExams, setPatientsWithExams] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI state
  const [showMedicinePriceInfo, setShowMedicinePriceInfo] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientExaminations, setPatientExaminations] = useState<Examination[]>(
    []
  );
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<
    Omit<
      Invoice,
      "id" | "totalAmount" | "isPaid" | "paymentDate" | "paymentMethod"
    >
  >({
    patientId: "",
    patientName: "",
    examDate: new Date().toISOString().slice(0, 10),
    consultationFee: consultationFee, // Use the value from our custom hook
    medicineFee: 0,
    otherFees: 0,
  });

  // Update form when regulation value changes
  useEffect(() => {
    setInvoiceForm((prev) => ({
      ...prev,
      consultationFee,
    }));
  }, [consultationFee]);

  // Load patients with examinations on component mount
  useEffect(() => {
    const loadPatientsWithExams = async () => {
      setLoading(true);
      try {
        // First, get all examinations
        const allExaminations = await firebaseService.getAllExaminations();

        // Then, create a unique set of patient IDs from these examinations
        const patientIds = new Set<string>();
        allExaminations.forEach((exam) => {
          if (exam.patientId) {
            patientIds.add(exam.patientId);
          }
        });

        // For each patient ID, fetch patient details
        const patients: Patient[] = [];
        for (const patientId of patientIds) {
          const patient = await firebaseService.getPatientById(patientId);
          if (patient) {
            patients.push(patient);
          }
        }

        // Set the patients with examinations
        setPatientsWithExams(patients);
      } catch (error) {
        console.error("Error loading patients with examinations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientsWithExams();

    // Also load recent invoices
    loadRecentInvoices();
  }, []);

  // Effect to recalculate medicine fee when examination changes
  useEffect(() => {
    if (selectedExamination) {
      console.log("selectedExamination changed, recalculating medicine fee");
      const medicineFee = calculateMedicineFee(selectedExamination);

      // Update form data with calculated fee
      setInvoiceForm((prev) => ({
        ...prev,
        medicineFee,
      }));
    }
  }, [selectedExamination]);

  // Load recent invoices from Firebase
  const loadRecentInvoices = async () => {
    setLoadingInvoices(true);
    try {
      console.log("Loading recent invoices...");

      // Lấy tất cả các hóa đơn từ Firestore
      const allInvoices = await firebaseService.getAllInvoices();

      if (allInvoices && allInvoices.length > 0) {
        // Đảm bảo mỗi hóa đơn có id
        const validInvoices = allInvoices.filter((invoice) => invoice.id);

        // Sắp xếp hóa đơn theo ngày, mới nhất lên đầu
        const sortedInvoices = [...validInvoices].sort(
          (a, b) =>
            new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
        );

        // Giới hạn hiển thị 5 hóa đơn gần đây nhất
        const recentInvoices = sortedInvoices.slice(0, 5);
        setInvoices(recentInvoices);
        console.log("Loaded recent invoices:", recentInvoices.length);
      } else {
        setInvoices([]);
        console.log("No invoices found");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Handle search for patients
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter the patients who have examinations
    const results = patientsWithExams.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
    );

    setSearchResults(results);
  };

  // Load examinations for selected patient
  const loadPatientExaminations = async (patientId: string) => {
    try {
      console.log("Loading examinations for patient ID:", patientId);
      const exams = await firebaseService.getExaminationsByPatient(patientId);
      console.log("Loaded examinations:", exams);
      setPatientExaminations(exams);

      if (exams.length > 0) {
        // Initially select the most recent examination
        const mostRecentExam = exams[0];
        setSelectedExamination(mostRecentExam);

        // Calculate medicine fee right away
        const medicineFee = calculateMedicineFee(mostRecentExam);
        console.log("Calculated medicine fee for exam:", medicineFee);
        console.log("Medicines in exam:", mostRecentExam.medicines);

        // Update invoice form with the examination date and calculated medicine fee
        setInvoiceForm((prev) => ({
          ...prev,
          examDate: mostRecentExam.examDate,
          medicineFee: medicineFee,
        }));

        // Verify that the form was updated correctly
        setTimeout(() => {
          console.log("Invoice form after update:", invoiceForm);
        }, 100);
      }
    } catch (error) {
      console.error("Error loading patient examinations:", error);
      setPatientExaminations([]);
      setSelectedExamination(null);
    }
  };

  // Calculate medicine fee based on examination
  const calculateMedicineFee = (exam: Examination): number => {
    console.log("Calculating medicine fee for examination:", exam);

    // If no medicines, return 0
    if (
      !exam.medicines ||
      !Array.isArray(exam.medicines) ||
      exam.medicines.length === 0
    ) {
      console.log(
        "No medicines found in examination or invalid medicines array",
        exam.medicines
      );
      return 0;
    }

    console.log("Medicines array found with length:", exam.medicines.length);
    console.log("Medicines data:", JSON.stringify(exam.medicines, null, 2));

    // Calculate based on actual medicines in the prescription
    let totalFee = 0;

    // For each medicine in the prescription
    exam.medicines.forEach((medicine, index) => {
      console.log(`Processing medicine ${index + 1}:`, medicine);

      // Skip invalid medicines
      if (!medicine || typeof medicine !== "object") {
        console.log(`Invalid medicine at index ${index}:`, medicine);
        return; // Skip this iteration
      }

      try {
        // Get medicine name and quantity
        const medicineName = medicine.name || "";
        const quantity = Number(medicine.quantity) || 1;
        const unit = medicine.unit || "Viên";

        if (!medicineName) {
          console.log(`Medicine at index ${index} has no name:`, medicine);
          return; // Skip this medicine
        }

        // Get price based on medicine name and unit
        const medicinePrice = getMedicinePriceEstimate(medicineName, unit);

        // Calculate cost based on quantity
        const medicineCost = medicinePrice * quantity;
        totalFee += medicineCost;

        console.log(
          `Medicine ${
            index + 1
          }: ${medicineName}, Price: ${medicinePrice}, Quantity: ${quantity}, Cost: ${medicineCost}`
        );
      } catch (error) {
        console.error(
          `Error calculating cost for medicine at index ${index}:`,
          error
        );
      }
    });

    console.log("Total medicine fee calculated:", totalFee);
    return totalFee;
  };

  // Get estimated price for a medicine
  const getMedicinePriceEstimate = (
    medicineName: string,
    unit = "Viên"
  ): number => {
    if (!medicineName) {
      console.log("No medicine name provided for price lookup");
      return getFallbackPriceByUnit(unit);
    }

    // Make it case insensitive for better matching
    const normalizedName = medicineName.toString().trim().toLowerCase();
    console.log(
      `Looking up price for medicine: "${medicineName}" (normalized: "${normalizedName}")`
    );

    // First, try exact match (case insensitive)
    for (const [name, price] of Object.entries(commonMedicinePrices)) {
      if (name.toLowerCase() === normalizedName) {
        console.log(`Found exact match for "${medicineName}": ${price}`);
        return price;
      }
    }

    // If exact match not found, try contains match
    for (const [name, price] of Object.entries(commonMedicinePrices)) {
      if (
        name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(name.toLowerCase())
      ) {
        console.log(
          `Found partial match for "${medicineName}": ${price} (from ${name})`
        );
        return price;
      }
    }

    // If still no match, use fallback price based on unit
    const fallbackPrice = getFallbackPriceByUnit(unit);
    console.log(
      `No price found for "${medicineName}", using fallback price by unit (${unit}): ${fallbackPrice}`
    );
    return fallbackPrice;
  };

  // Get fallback price based on medicine unit
  const getFallbackPriceByUnit = (unit: string): number => {
    const normalizedUnit = unit.toString().trim().toLowerCase();

    // Set fallback prices based on unit type
    switch (normalizedUnit) {
      case "viên":
        return 10000;
      case "ống":
        return 15000;
      case "chai":
        return 25000;
      case "gói":
        return 8000;
      case "vỉ":
        return 20000;
      default:
        return 10000;
    }
  };

  // Select a patient for invoice creation
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setInvoiceForm({
      ...invoiceForm,
      patientId: patient.id || "",
      patientName: patient.name,
    });
    loadPatientExaminations(patient.id || "");
    setSearchResults([]);
    setSearchTerm("");
  };

  // Handle select examination
  const handleSelectExamination = (exam: Examination) => {
    console.log("Selected examination:", exam);

    // Normalize the examination data to ensure proper structure
    const normalizedExam = normalizeExaminationData(exam);

    setSelectedExamination(normalizedExam);

    // Calculate medicine fee for this examination
    const medicineFee = calculateMedicineFee(normalizedExam);

    // Update invoice form with examination date and calculated medicine fee
    setInvoiceForm((prev) => ({
      ...prev,
      examDate: normalizedExam.examDate,
      medicineFee: medicineFee,
    }));

    console.log("Selected examination, calculated fee:", medicineFee);
  };

  // Normalize examination data to ensure it has the expected structure
  const normalizeExaminationData = (exam: Examination): Examination => {
    if (!exam) return exam;

    // Create a copy to avoid mutating the original
    const normalizedExam = { ...exam };

    // Ensure medicines is an array
    if (!normalizedExam.medicines) {
      normalizedExam.medicines = [];
    } else if (!Array.isArray(normalizedExam.medicines)) {
      // If medicines is not an array but exists, try to convert it
      try {
        if (typeof normalizedExam.medicines === "object") {
          // Firebase sometimes stores arrays as objects with numeric keys
          normalizedExam.medicines = Object.values(normalizedExam.medicines);
        } else {
          // If it's something else entirely, reset to empty array
          normalizedExam.medicines = [];
        }
      } catch (error) {
        console.error("Error normalizing medicines data:", error);
        normalizedExam.medicines = [];
      }
    }

    // Normalize each medicine in the array
    normalizedExam.medicines = normalizedExam.medicines
      .map((medicine, index) => {
        if (!medicine) {
          console.log(`Empty medicine at index ${index}, skipping`);
          return null;
        }

        try {
          // Ensure medicine is an object
          if (typeof medicine !== "object") {
            console.log(
              `Medicine at index ${index} is not an object:`,
              medicine
            );
            return null;
          }

          // Create normalized medicine object with default values for missing properties
          const normalizedMedicine = {
            id: medicine.id || `med_${index}`,
            name: medicine.name || "Unknown Medicine",
            unit: medicine.unit || "Viên",
            quantity: Number(medicine.quantity) || 1,
            usage: medicine.usage || "Theo chỉ dẫn",
          };

          return normalizedMedicine;
        } catch (error) {
          console.error(`Error normalizing medicine at index ${index}:`, error);
          return null;
        }
      })
      .filter((medicine) => medicine !== null); // Remove any null items

    console.log("Normalized examination data:", normalizedExam);
    return normalizedExam as Examination;
  };

  // Update form fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (
      name === "consultationFee" ||
      name === "medicineFee" ||
      name === "otherFees"
    ) {
      setInvoiceForm({
        ...invoiceForm,
        [name]: parseInt(value) || 0,
      });
    } else {
      setInvoiceForm({
        ...invoiceForm,
        [name]: value,
      });
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return (
      invoiceForm.consultationFee +
      invoiceForm.medicineFee +
      invoiceForm.otherFees
    );
  };

  // Save the invoice
  const handleSaveInvoice = async () => {
    if (!invoiceForm.patientId || !invoiceForm.examDate) {
      alert("Vui lòng điền đầy đủ thông tin hóa đơn");
      return;
    }

    try {
      // Show saving indicator
      setIsSaving(true);
      console.log("Starting invoice save process");

      // Ensure totalAmount is calculated
      const totalAmount = calculateTotal();

      // Prepare the invoice data for saving
      const invoiceData = {
        patientId: invoiceForm.patientId,
        patientName: invoiceForm.patientName,
        examDate: invoiceForm.examDate,
        consultationFee: invoiceForm.consultationFee,
        medicineFee: invoiceForm.medicineFee,
        otherFees: invoiceForm.otherFees,
        totalAmount: totalAmount,
        isPaid: false,
      };

      console.log("Invoice data to save:", invoiceData);

      try {
        // Save to Firebase
        const invoiceId = await firebaseService.addInvoice(invoiceData);
        console.log("Firebase returned invoice ID:", invoiceId);

        if (invoiceId) {
          // Add to local state with the new ID
          const savedInvoice: Invoice = {
            ...invoiceData,
            id: invoiceId,
          };

          console.log("Added invoice to local state:", savedInvoice);
          setInvoices([savedInvoice, ...invoices]);

          // Xóa bệnh nhân khỏi danh sách chờ khám
          if (selectedPatient?.id) {
            try {
              const currentDate = new Date().toISOString().slice(0, 10);
              await firebaseService.removePatientFromWaitingList(
                selectedPatient.id,
                currentDate
              );
              console.log("Đã xóa bệnh nhân khỏi danh sách chờ khám");
            } catch (removeError) {
              console.error(
                "Lỗi khi xóa bệnh nhân khỏi danh sách chờ khám:",
                removeError
              );
              // Không hiển thị lỗi cho người dùng vì hóa đơn đã được lưu thành công
            }
          }

          // Reset form
          setInvoiceForm({
            patientId: "",
            patientName: "",
            examDate: new Date().toISOString().slice(0, 10),
            consultationFee: consultationFee,
            medicineFee: 0,
            otherFees: 0,
          });

          setSelectedPatient(null);
          setSelectedExamination(null);
          setPatientExaminations([]);

          alert("Đã lưu hóa đơn thành công!");

          // Reload invoices
          loadRecentInvoices();
        } else {
          throw new Error("Không nhận được ID hóa đơn từ Firebase");
        }
      } catch (firebaseError: Error | unknown) {
        console.error("Firebase error saving invoice:", firebaseError);
        const errorMessage =
          firebaseError instanceof Error
            ? firebaseError.message
            : "Lỗi không xác định";
        alert(`Lỗi khi lưu vào cơ sở dữ liệu: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error in handleSaveInvoice:", error);
      alert("Có lỗi xảy ra khi lưu hóa đơn. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Mark invoice as paid
  const handleMarkAsPaid = async (id: string) => {
    try {
      // Cập nhật trạng thái thanh toán trong Firestore
      const success = await firebaseService.updateInvoicePayment(
        id,
        true,
        medicalConfig.paymentMethods[0] // Sử dụng phương thức thanh toán mặc định
      );

      if (success) {
        // Cập nhật UI nếu thành công
        setInvoices(
          invoices.map((invoice) =>
            invoice.id === id
              ? {
                  ...invoice,
                  isPaid: true,
                  paymentDate: new Date().toISOString().slice(0, 10),
                  paymentMethod: medicalConfig.paymentMethods[0],
                }
              : invoice
          )
        );
        alert("Đã cập nhật trạng thái thanh toán");
      } else {
        alert("Không thể cập nhật trạng thái thanh toán");
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      alert("Lỗi khi cập nhật trạng thái thanh toán");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date - sử dụng cách định dạng nhất quán giữa server và client
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout title="Lập hóa đơn thanh toán">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Lập Hóa Đơn Thanh Toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create invoice form */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Tạo hóa đơn mới</h2>

              {/* Patient selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bệnh nhân <span className="text-red-500">*</span> (chỉ hiển
                  thị bệnh nhân đã có phiếu khám)
                </label>

                {selectedPatient ? (
                  <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <div>
                      <p className="font-medium">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-600">
                        SĐT: {selectedPatient.phoneNumber}
                      </p>
                    </div>
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setSelectedPatient(null);
                        setPatientExaminations([]);
                        setSelectedExamination(null);
                      }}
                    >
                      Thay đổi
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        className="flex-grow px-3 py-2 border rounded-l"
                        placeholder="Tìm bệnh nhân theo tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 flex items-center"
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        {loading ? (
                          <FaSpinner className="inline mr-1 animate-spin" />
                        ) : (
                          <FaSearch className="inline mr-1" />
                        )}{" "}
                        Tìm
                      </button>
                    </div>

                    {loading && (
                      <div className="text-center py-3">
                        <FaSpinner className="inline-block animate-spin text-blue-500 mr-2" />
                        Đang tải danh sách bệnh nhân...
                      </div>
                    )}

                    {!loading && searchResults.length > 0 && (
                      <div className="border rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Họ tên
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số điện thoại
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {searchResults.map((patient) => (
                              <tr key={patient.id}>
                                <td className="px-4 py-2">{patient.name}</td>
                                <td className="px-4 py-2">
                                  {patient.phoneNumber}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => handleSelectPatient(patient)}
                                  >
                                    Chọn
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!loading && searchTerm && searchResults.length === 0 && (
                      <div className="text-center py-3 text-gray-500">
                        Không tìm thấy bệnh nhân phù hợp đã có phiếu khám
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Examination selection */}
              {selectedPatient && patientExaminations.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phiếu khám <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {patientExaminations.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3 border rounded cursor-pointer ${
                          selectedExamination?.id === exam.id
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectExamination(exam)}
                      >
                        <p className="font-medium">
                          Ngày khám: {formatDate(exam.examDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Chẩn đoán: {exam.diagnosis}
                        </p>
                        <p className="text-sm text-gray-600">
                          Số loại thuốc: {exam.medicines.length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    className="w-full px-3 py-2 border rounded"
                    value={invoiceForm.examDate}
                    onChange={handleInputChange}
                    readOnly={selectedExamination !== null}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền khám
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    className="w-full px-3 py-2 border rounded"
                    value={invoiceForm.consultationFee}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền thuốc
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="medicineFee"
                      className="w-full px-3 py-2 border rounded"
                      value={invoiceForm.medicineFee}
                      onChange={handleInputChange}
                      readOnly={selectedExamination !== null}
                    />
                    {selectedExamination && (
                      <div className="absolute right-2 top-2 flex">
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-800 mr-2"
                          onClick={() => {
                            if (selectedExamination) {
                              const fee =
                                calculateMedicineFee(selectedExamination);
                              setInvoiceForm((prev) => ({
                                ...prev,
                                medicineFee: fee,
                              }));
                              alert(
                                `Đã tính lại tiền thuốc: ${fee.toLocaleString()} VND`
                              );
                            }
                          }}
                          title="Tính lại tiền thuốc"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => setShowMedicinePriceInfo(true)}
                          title="Thông tin giá thuốc"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    )}
                  </div>
                  {selectedExamination && (
                    <div className="text-xs text-gray-500 mt-1">
                      <p>
                        Tự động tính dựa trên đơn thuốc (
                        {selectedExamination.medicines.length} loại thuốc):
                      </p>
                      <div className="mt-1 max-h-28 overflow-y-auto text-xs bg-gray-50 p-1 rounded">
                        <table className="w-full">
                          <tbody>
                            {selectedExamination.medicines.map(
                              (medicine, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="py-1">{medicine.name}</td>
                                  <td className="py-1 text-right">
                                    {medicine.quantity} {medicine.unit}
                                  </td>
                                  <td className="py-1 text-right">
                                    {formatCurrency(
                                      getMedicinePriceEstimate(
                                        medicine.name,
                                        medicine.unit
                                      ) * (Number(medicine.quantity) || 1)
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chi phí khác
                  </label>
                  <input
                    type="number"
                    name="otherFees"
                    className="w-full px-3 py-2 border rounded"
                    value={invoiceForm.otherFees}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  Tổng tiền: {formatCurrency(calculateTotal())}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                    onClick={handleSaveInvoice}
                    disabled={
                      !selectedPatient || !selectedExamination || isSaving
                    }
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Lưu hóa đơn
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Hóa đơn gần đây</h2>

              {loadingInvoices ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-blue-500 text-2xl mb-2" />
                  <p className="text-gray-500">Đang tải dữ liệu hóa đơn...</p>
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{invoice.patientName}</p>
                          <p className="text-sm text-gray-600">
                            Ngày khám: {formatDate(invoice.examDate)}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs ${
                            invoice.isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Tiền khám:</span>{" "}
                          {formatCurrency(invoice.consultationFee)}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Tiền thuốc:</span>{" "}
                          {formatCurrency(invoice.medicineFee)}
                        </p>
                        {invoice.otherFees > 0 && (
                          <p className="text-sm">
                            <span className="text-gray-600">Chi phí khác:</span>{" "}
                            {formatCurrency(invoice.otherFees)}
                          </p>
                        )}
                        <p className="font-medium mt-1">
                          Tổng tiền: {formatCurrency(invoice.totalAmount)}
                        </p>
                      </div>

                      {!invoice.isPaid && (
                        <div className="mt-2 text-right">
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            onClick={() => handleMarkAsPaid(invoice.id || "")}
                          >
                            Đánh dấu đã thanh toán
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có hóa đơn nào</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Price Info Modal */}
      {showMedicinePriceInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Giá thuốc tham khảo</h3>
              <button
                onClick={() => setShowMedicinePriceInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm text-gray-600">
                Bảng giá thuốc tham khảo được sử dụng để tính hóa đơn. Trong hệ
                thống thực tế, giá thuốc sẽ được lấy từ cơ sở dữ liệu quản lý
                thuốc.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left border">Tên thuốc</th>
                    <th className="p-2 text-right border">Giá (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(commonMedicinePrices).map(
                    ([name, price], index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="p-2 border">{name}</td>
                        <td className="p-2 text-right border">
                          {formatCurrency(price)}
                        </td>
                      </tr>
                    )
                  )}
                  <tr>
                    <td className="p-2 border font-medium">
                      Các loại thuốc khác
                    </td>
                    <td className="p-2 text-right border">
                      {formatCurrency(10000)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setShowMedicinePriceInfo(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
