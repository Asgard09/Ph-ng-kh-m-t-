"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaPrint, FaArrowLeft } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { medicalConfig } from "@/config/medicalConfig";
import * as firebaseService from "@/services/firebaseService";
import type { Patient, Examination } from "@/services/firebaseService";
import { useRouter } from "next/navigation";

// Define interfaces for data types
interface Medicine {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  usage: string;
}

interface ExaminationForm {
  id: string;
  patientId: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
  patientPhone: string;
  examDate: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
}

export default function ExaminationFormPage() {
  // State for form data
  const [formData, setFormData] = useState<Omit<ExaminationForm, "id">>({
    patientId: "",
    patientName: "",
    patientGender: "",
    patientAge: 0,
    patientPhone: "",
    examDate: new Date().toISOString().slice(0, 10),
    symptoms: "",
    diagnosis: "",
    notes: "",
    medicines: [],
  });

  // State for patient list dropdown
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(false);

  // State for viewing saved examinations
  const [showExaminations, setShowExaminations] = useState<boolean>(false);
  const [savedExaminations, setSavedExaminations] = useState<Examination[]>([]);
  const [loadingExaminations, setLoadingExaminations] =
    useState<boolean>(false);

  // State for viewing examination details
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);
  const [patientDetail, setPatientDetail] = useState<Patient | null>(null);
  const [loadingPatientDetail, setLoadingPatientDetail] =
    useState<boolean>(false);

  // State to track if we're viewing an examination from search page
  const [viewingFromSearch, setViewingFromSearch] = useState<boolean>(false);

  // State for patients who already have examinations (to filter them out from dropdown)
  const [patientsWithExams, setPatientsWithExams] = useState<Set<string>>(
    new Set()
  );

  // State for new medicine form
  const [medicineForm, setMedicineForm] = useState<Omit<Medicine, "id">>({
    name: "",
    unit: "",
    quantity: medicalConfig.defaultMedicineQuantity,
    usage: "",
  });

  // State for saved forms
  const [savedForms, setSavedForms] = useState<ExaminationForm[]>([]);

  const router = useRouter();

  // Load all patients for the dropdown
  useEffect(() => {
    const fetchAllPatients = async () => {
      setLoadingPatients(true);
      try {
        // Sử dụng hàm searchPatients với chuỗi rỗng để lấy tất cả bệnh nhân
        const patients = await firebaseService.searchPatients("");
        console.log("Loaded patients for dropdown:", patients.length);
        setPatientList(patients);

        // Also fetch all examinations to identify patients who already have them
        setLoadingExaminations(true);
        const allExaminations = await firebaseService.getAllExaminations();
        setSavedExaminations(allExaminations);

        // Create a set of patient IDs who already have examinations
        const patientIdsWithExams = new Set<string>(
          allExaminations.map((exam) => exam.patientId)
        );
        setPatientsWithExams(patientIdsWithExams);

        console.log("Patients with existing exams:", patientIdsWithExams.size);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingPatients(false);
        setLoadingExaminations(false);
      }
    };

    fetchAllPatients();
  }, []);

  // Load patient data and examination data from sessionStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for selected examination from patient search
      const selectedExamInSession = sessionStorage.getItem(
        "selectedExamination"
      );

      if (selectedExamInSession) {
        try {
          const examinationData = JSON.parse(selectedExamInSession);
          console.log("Found selected examination:", examinationData);

          // Set the examination to view
          setSelectedExamination(examinationData);
          setViewingFromSearch(true);

          // Load the patient details if available
          const selectedPatientJSON = sessionStorage.getItem("selectedPatient");
          if (selectedPatientJSON) {
            const patientData = JSON.parse(selectedPatientJSON);
            setPatientDetail(patientData);
          }

          // Clear selectedExamination to avoid showing it on page refresh
          sessionStorage.removeItem("selectedExamination");

          // Show the examination view
          setShowExaminations(true);

          return; // Skip other loading if we're viewing a specific examination
        } catch (error) {
          console.error("Error parsing selected examination data:", error);
        }
      }

      const selectedPatientJSON = sessionStorage.getItem("selectedPatient");

      if (selectedPatientJSON) {
        try {
          const selectedPatient = JSON.parse(selectedPatientJSON);
          console.log("Found selected patient:", selectedPatient);

          // Calculate age from date of birth
          const birthYear = new Date(selectedPatient.dateOfBirth).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;

          // Update form data with patient info
          setFormData((prev) => ({
            ...prev,
            patientId: selectedPatient.id || "",
            patientName: selectedPatient.name || "",
            patientGender: selectedPatient.gender || "",
            patientAge: age || 0,
            patientPhone: selectedPatient.phoneNumber || "",
          }));

          // Clear the selected patient from sessionStorage to avoid reloading it
          // on page refreshes after the initial load
          sessionStorage.removeItem("selectedPatient");
        } catch (error) {
          console.error("Error parsing selected patient data:", error);
        }
      }
    }
  }, []);

  // Handle selecting a patient from dropdown
  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatientId = e.target.value;

    if (!selectedPatientId) {
      // Reset form if "Choose" is selected
      setFormData({
        ...formData,
        patientId: "",
        patientName: "",
        patientGender: "",
        patientAge: 0,
        patientPhone: "",
      });
      return;
    }

    // Find the selected patient in the list
    const selectedPatient = patientList.find((p) => p.id === selectedPatientId);

    if (selectedPatient) {
      // Calculate age from date of birth
      const birthYear = new Date(selectedPatient.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      // Update form with patient data
      setFormData({
        ...formData,
        patientId: selectedPatient.id || "",
        patientName: selectedPatient.name,
        patientGender: selectedPatient.gender,
        patientAge: age,
        patientPhone: selectedPatient.phoneNumber || "",
      });
    }
  };

  // Handle input change for patient data
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle input change for medicine form
  const handleMedicineInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      setMedicineForm({
        ...medicineForm,
        [name]: parseInt(value) || 0,
      });
    } else {
      setMedicineForm({
        ...medicineForm,
        [name]: value,
      });
    }
  };

  // Add a common medicine from preset list
  const handleAddCommonMedicine = (
    commonMedicine: (typeof medicalConfig.commonMedicines)[0]
  ) => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: commonMedicine.name,
      unit: commonMedicine.unit,
      quantity: medicalConfig.defaultMedicineQuantity,
      usage: commonMedicine.defaultUsage,
    };

    setFormData({
      ...formData,
      medicines: [...formData.medicines, newMedicine],
    });
  };

  // Set common diagnosis
  const handleSetDiagnosis = (diagnosis: string) => {
    setFormData({
      ...formData,
      diagnosis,
    });
  };

  // Add a medicine to the prescription
  const handleAddMedicine = () => {
    if (!medicineForm.name || !medicineForm.unit || !medicineForm.usage) {
      alert("Vui lòng điền đầy đủ thông tin thuốc");
      return;
    }

    const newMedicine: Medicine = {
      ...medicineForm,
      id: Date.now().toString(),
    };

    setFormData({
      ...formData,
      medicines: [...formData.medicines, newMedicine],
    });

    // Reset medicine form
    setMedicineForm({
      name: "",
      unit: "",
      quantity: 1,
      usage: "",
    });
  };

  // Remove a medicine from the prescription
  const handleRemoveMedicine = (id: string) => {
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((med) => med.id !== id),
    });
  };

  // Validate form before saving
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.patientName) errors.push("Tên bệnh nhân không được để trống");
    if (!formData.patientGender) errors.push("Giới tính không được để trống");
    if (!formData.patientAge) errors.push("Tuổi không được để trống");
    if (!formData.symptoms) errors.push("Triệu chứng không được để trống");
    if (!formData.diagnosis) errors.push("Chẩn đoán không được để trống");

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return false;
    }

    return true;
  };

  // Save the examination form
  const handleSaveForm = async () => {
    if (!validateForm()) return;

    try {
      // First, save patient information to the Patients collection
      let patientId = "";
      if (formData.patientName && formData.patientGender) {
        // Calculate date of birth from age
        const today = new Date();
        const birthYear = today.getFullYear() - formData.patientAge;
        const dateOfBirth = `${birthYear}-01-01`; // Default to Jan 1 since we only have the age

        // Prepare patient data for Firebase
        const patientData = {
          name: formData.patientName,
          gender: formData.patientGender,
          dateOfBirth,
          phoneNumber: formData.patientPhone || "",
          address: "", // We don't have address in the examination form
          registrationDate: formData.examDate, // Explicitly set to match the examination date
          registrationTime: new Date().toLocaleTimeString("vi-VN"), // Current time
        };

        console.log("Saving patient to database:", patientData);

        // Save patient to database
        patientId = await firebaseService.addPatient(patientData);
      }

      // Now save the examination form to Firebase
      if (patientId) {
        const examinationData = {
          patientId,
          patientName: formData.patientName,
          examDate: formData.examDate,
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          medicines: formData.medicines,
        };

        console.log("Saving examination to database:", examinationData);
        await firebaseService.addExamination(examinationData);
      }

      // Now save the examination form locally
      const newForm: ExaminationForm = {
        ...formData,
        id: Date.now().toString(),
      };

      setSavedForms([...savedForms, newForm]);

      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        patientGender: "",
        patientAge: 0,
        patientPhone: "",
        examDate: new Date().toISOString().slice(0, 10),
        symptoms: "",
        diagnosis: "",
        notes: "",
        medicines: [],
      });

      alert("Đã lưu phiếu khám bệnh thành công!");
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Có lỗi xảy ra khi lưu phiếu khám bệnh. Vui lòng thử lại.");
    }
  };

  // Print the examination form
  const handleViewExaminations = () => {
    setShowExaminations(true);
  };

  // Get filtered patient list (excluding those with existing examinations)
  const getFilteredPatientList = () => {
    if (patientsWithExams.size === 0) return patientList;
    return patientList.filter(
      (patient) => !patientsWithExams.has(patient.id || "")
    );
  };

  // View examination details
  const handleViewExaminationDetail = async (exam: Examination) => {
    setSelectedExamination(exam);

    // Load patient details if needed
    if (exam.patientId) {
      setLoadingPatientDetail(true);
      try {
        const patientData = await firebaseService.getPatientById(
          exam.patientId
        );
        if (patientData) {
          setPatientDetail(patientData);
        }
      } catch (error) {
        console.error("Error loading patient details:", error);
      } finally {
        setLoadingPatientDetail(false);
      }
    }
  };

  // Close examination details view
  const handleCloseExaminationDetail = () => {
    setSelectedExamination(null);
    setPatientDetail(null);
  };

  // Calculate patient age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Go back to search page
  const handleGoBackToSearch = () => {
    router.push("/medical/patient-search");
  };

  return (
    <DashboardLayout title="Lập phiếu khám bệnh">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lập Phiếu Khám Bệnh</h1>
          <div className="flex space-x-2">
            {!selectedExamination && !showExaminations && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                onClick={handleSaveForm}
              >
                <FaSave className="mr-2" /> Lưu phiếu khám
              </button>
            )}
            {viewingFromSearch && selectedExamination && (
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                onClick={handleGoBackToSearch}
              >
                <FaArrowLeft className="mr-2" /> Quay lại tìm kiếm
              </button>
            )}
            {!viewingFromSearch && (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                onClick={
                  showExaminations
                    ? () => setShowExaminations(false)
                    : handleViewExaminations
                }
              >
                <FaPrint className="mr-2" />{" "}
                {showExaminations ? "Quay lại form" : "Xem phiếu khám"}
              </button>
            )}
          </div>
        </div>

        {selectedExamination ? (
          // Display examination details
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chi tiết phiếu khám</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={handleCloseExaminationDetail}
              >
                Quay lại danh sách
              </button>
            </div>

            {loadingPatientDetail ? (
              <div className="text-center py-4">
                Đang tải thông tin bệnh nhân...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Thông tin bệnh nhân */}
                <div className="border-b pb-4">
                  <h3 className="text-md font-medium mb-3">
                    Thông tin bệnh nhân
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Họ và tên</span>
                      <span className="font-medium">
                        {selectedExamination.patientName}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Giới tính</span>
                      <span className="font-medium">
                        {patientDetail?.gender || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Tuổi</span>
                      <span className="font-medium">
                        {patientDetail
                          ? calculateAge(patientDetail.dateOfBirth)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        Số điện thoại
                      </span>
                      <span className="font-medium">
                        {patientDetail?.phoneNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Địa chỉ</span>
                      <span className="font-medium">
                        {patientDetail?.address || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Ngày khám</span>
                      <span className="font-medium">
                        {selectedExamination.examDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin khám bệnh */}
                <div className="border-b pb-4">
                  <h3 className="text-md font-medium mb-3">
                    Thông tin khám bệnh
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Triệu chứng</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {selectedExamination.symptoms}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Chẩn đoán</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {selectedExamination.diagnosis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Đơn thuốc */}
                <div>
                  <h3 className="text-md font-medium mb-3">Đơn thuốc</h3>
                  {selectedExamination.medicines &&
                  selectedExamination.medicines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              STT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên thuốc
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Đơn vị
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cách dùng
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedExamination.medicines.map(
                            (medicine, index) => (
                              <tr key={medicine.id || index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {medicine.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {medicine.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {medicine.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {medicine.usage}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded">
                      Không có thuốc trong đơn
                    </div>
                  )}
                </div>

                {/* Nút in phiếu khám */}
                <div className="text-right mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center ml-auto"
                    onClick={() =>
                      alert("Chức năng in phiếu khám sẽ được phát triển sau")
                    }
                  >
                    <FaPrint className="mr-2" /> In phiếu khám
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : showExaminations ? (
          // Display saved examinations list
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Phiếu khám đã lưu</h2>
            </div>

            {loadingExaminations ? (
              <div className="text-center py-4">Đang tải phiếu khám...</div>
            ) : savedExaminations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày khám
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chẩn đoán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số loại thuốc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedExaminations.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewExaminationDetail(exam)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.examDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 hover:underline">
                          {exam.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.diagnosis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.medicines.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                Chưa có phiếu khám nào được lưu
              </div>
            )}
          </div>
        ) : (
          // Normal examination form
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin bệnh nhân
              </h2>

              {/* Dropdown to select existing patient */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn bệnh nhân từ danh sách
                </label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  onChange={handlePatientSelect}
                  value={formData.patientId}
                  disabled={loadingPatients}
                >
                  <option value="">-- Chọn bệnh nhân --</option>
                  {getFilteredPatientList().map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.gender} -{" "}
                      {new Date(patient.dateOfBirth).getFullYear()} -{" "}
                      {patient.phoneNumber}
                    </option>
                  ))}
                </select>
                {loadingPatients && (
                  <p className="text-sm text-gray-500 mt-1">
                    Đang tải danh sách bệnh nhân...
                  </p>
                )}
                {!loadingPatients && getFilteredPatientList().length === 0 && (
                  <p className="text-sm text-amber-500 mt-1">
                    Tất cả bệnh nhân đã có phiếu khám
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.patientName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới Tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="patientGender"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.patientGender}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuổi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="patientAge"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.patientAge || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    name="patientPhone"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.patientPhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.examDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-4 mt-6">
                Thông tin khám bệnh
              </h2>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Triệu chứng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="symptoms"
                    rows={2}
                    className="w-full px-3 py-2 border rounded"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chẩn đoán <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col">
                    <textarea
                      name="diagnosis"
                      rows={2}
                      className="w-full px-3 py-2 border rounded mb-2"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                    ></textarea>
                    <div className="flex flex-wrap gap-1">
                      {medicalConfig.commonDiagnoses.map((diagnosis, index) => (
                        <button
                          key={index}
                          type="button"
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          onClick={() => handleSetDiagnosis(diagnosis)}
                        >
                          {diagnosis}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-3 py-2 border rounded"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Đơn thuốc</h2>

              {/* Common medicines */}
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Thuốc thường dùng</h3>
                <div className="flex flex-wrap gap-2">
                  {medicalConfig.commonMedicines.map((medicine, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm"
                      onClick={() => handleAddCommonMedicine(medicine)}
                    >
                      {medicine.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicine list */}
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên thuốc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn vị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cách dùng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.medicines.length > 0 ? (
                      formData.medicines.map((medicine, index) => (
                        <tr key={medicine.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {medicine.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {medicine.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {medicine.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {medicine.usage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveMedicine(medicine.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          Chưa có thuốc trong đơn
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add new medicine form */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Thêm thuốc mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên thuốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border rounded"
                      value={medicineForm.name}
                      onChange={handleMedicineInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="unit"
                      className="w-full px-3 py-2 border rounded"
                      value={medicineForm.unit}
                      onChange={handleMedicineInputChange}
                    >
                      <option value="">Chọn đơn vị</option>
                      {medicalConfig.medicineUnits.map((unit, index) => (
                        <option key={index} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      className="w-full px-3 py-2 border rounded"
                      value={medicineForm.quantity}
                      onChange={handleMedicineInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cách dùng <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="usage"
                        className="w-full px-3 py-2 border rounded-l"
                        value={medicineForm.usage}
                        onChange={handleMedicineInputChange}
                      />
                      <button
                        className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600"
                        onClick={handleAddMedicine}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
