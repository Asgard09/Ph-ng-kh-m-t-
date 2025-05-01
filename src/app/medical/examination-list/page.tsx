"use client";

import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaStethoscope,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { validationConfig } from "@/config";
import { formatDate, getCurrentDate } from "@/utils/helpers";
import * as firebaseService from "@/services/firebaseService";
import type { Patient } from "@/services/firebaseService";
import { useRouter } from "next/navigation";
import { useRegulationValue } from "@/hooks/useRegulationValue";

export default function ExaminationListPage() {
  const router = useRouter();

  // Lấy số lượng bệnh nhân tối đa từ quy định
  const maxPatientsPerDay = useRegulationValue("maxPatientsPerDay");

  // States
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDate());
  const [loading, setLoading] = useState<boolean>(false);
  const [savingPatient, setSavingPatient] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // State for form data
  const [patientForm, setPatientForm] = useState<
    Omit<
      Patient,
      "id" | "registrationTime" | "registrationDate" | "createdAt" | "updatedAt"
    >
  >({
    name: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
  });

  // Load patients for the current date
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching patients for date:", currentDate);
        const patients = await firebaseService.getPatientsByDate(currentDate);
        console.log("Patients retrieved:", patients);

        if (patients.length > 0) {
          console.log("Found patients for today:", patients.length);
          setPatientList(patients);
        } else {
          console.log("No patients found for date:", currentDate);
          setPatientList([]);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Không thể tải danh sách bệnh nhân. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentDate]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
  };

  // Validate patient data
  const validatePatientData = (data: typeof patientForm) => {
    const errors = [];

    if (!data.name.trim()) errors.push("Họ và tên không được để trống");
    if (!data.gender) errors.push("Giới tính không được để trống");
    if (!data.dateOfBirth) errors.push("Ngày sinh không được để trống");

    if (!data.phoneNumber) {
      errors.push("Số điện thoại không được để trống");
    } else if (!validationConfig.phoneRegex.test(data.phoneNumber)) {
      errors.push("Số điện thoại phải có 10 số và bắt đầu bằng số 0");
    }

    return errors;
  };

  // Handle adding a patient
  const handleAddPatient = async () => {
    // Kiểm tra giới hạn số lượng bệnh nhân
    if (patientList.length >= maxPatientsPerDay) {
      alert(
        `Không thể thêm bệnh nhân. Đã đạt giới hạn số lượng tối đa (${maxPatientsPerDay}) trong ngày.`
      );
      return;
    }

    const errors = validatePatientData(patientForm);

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setSavingPatient(true);

      // Save patient to database
      const patientId = await firebaseService.addPatient(patientForm);

      // Update the UI with the new patient (including the generated ID)
      const now = new Date();
      const newPatient: Patient = {
        ...patientForm,
        id: patientId,
        registrationTime: now.toLocaleTimeString("vi-VN"),
        registrationDate: currentDate,
      };

      setPatientList([...patientList, newPatient]);

      // Reset form
      setPatientForm({
        name: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        phoneNumber: "",
      });

      // Show success message
      alert("Đã thêm bệnh nhân vào danh sách khám bệnh");
    } catch (err) {
      console.error("Error adding patient:", err);
      alert("Lỗi khi thêm bệnh nhân. Vui lòng thử lại.");
    } finally {
      setSavingPatient(false);
    }
  };

  // Handle editing a patient
  const handleEditPatient = async (id: string) => {
    if (!id) return;

    try {
      // Get current patient data
      const currentPatient = patientList.find((p) => p.id === id);
      if (!currentPatient) {
        alert("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      // Set editing patient and show modal
      setEditingPatient(currentPatient);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error preparing to edit patient:", err);
      alert("Lỗi khi chuẩn bị chỉnh sửa thông tin bệnh nhân");
    }
  };

  // Handle saving edited patient
  const handleSaveEdit = async () => {
    if (!editingPatient) return;

    const errors = validatePatientData(editingPatient);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setSavingPatient(true);
      const success = await firebaseService.updatePatient(editingPatient.id!, {
        name: editingPatient.name,
        gender: editingPatient.gender,
        dateOfBirth: editingPatient.dateOfBirth,
        address: editingPatient.address,
        phoneNumber: editingPatient.phoneNumber,
      });

      if (success) {
        // Update local state
        setPatientList(
          patientList.map((p) =>
            p.id === editingPatient.id ? editingPatient : p
          )
        );
        setShowEditModal(false);
        setEditingPatient(null);
        alert("Đã cập nhật thông tin bệnh nhân thành công");
      } else {
        alert("Không thể cập nhật thông tin bệnh nhân. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Lỗi khi cập nhật thông tin bệnh nhân");
    } finally {
      setSavingPatient(false);
    }
  };

  // Handle deleting a patient
  const handleDeletePatient = async (id: string) => {
    if (!id) return;

    if (
      window.confirm("Bạn có chắc chắn muốn xóa bệnh nhân này khỏi danh sách?")
    ) {
      try {
        setLoading(true);
        const success = await firebaseService.deletePatient(id);

        if (success) {
          // Update local state if deletion was successful
          setPatientList(patientList.filter((patient) => patient.id !== id));
          alert("Đã xóa bệnh nhân khỏi danh sách");
        } else {
          alert("Không thể xóa bệnh nhân. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Error deleting patient:", err);
        alert("Lỗi khi xóa bệnh nhân. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle selecting a patient for examination
  const handleSelectForExam = (patient: Patient) => {
    // Store patient data in sessionStorage to retrieve in the examination form
    sessionStorage.setItem(
      "selectedPatient",
      JSON.stringify({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        phoneNumber: patient.phoneNumber,
      })
    );

    // Navigate to examination form page
    router.push("/medical/examination-form");
  };

  return (
    <DashboardLayout title="Lập danh sách khám bệnh">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lập Danh Sách Khám Bệnh</h1>
          <div className="flex items-center">
            <span className="mr-2">Ngày khám:</span>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={currentDate}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Thêm bệnh nhân mới
            <span className="text-sm font-normal ml-2 text-gray-600">
              (Giới hạn: {patientList.length}/{maxPatientsPerDay} bệnh nhân)
            </span>
          </h2>
          {patientList.length >= maxPatientsPerDay ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              Đã đạt giới hạn số lượng bệnh nhân tối đa trong ngày (
              {maxPatientsPerDay}).
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={patientForm.name}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, name: e.target.value })
                }
                disabled={savingPatient}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới Tính <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={patientForm.gender}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, gender: e.target.value })
                }
                disabled={savingPatient}
              >
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={patientForm.dateOfBirth}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    dateOfBirth: e.target.value,
                  })
                }
                disabled={savingPatient}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Điện Thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded"
                value={patientForm.phoneNumber}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="0xxxxxxxxx"
                disabled={savingPatient}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa Chỉ
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={patientForm.address}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, address: e.target.value })
                }
                disabled={savingPatient}
              />
            </div>
          </div>
          <div className="text-right">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              onClick={handleAddPatient}
              disabled={savingPatient}
            >
              {savingPatient ? (
                <>
                  <FaSpinner className="inline mr-1 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <FaPlus className="inline mr-1" /> Thêm vào danh sách
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Danh Sách Bệnh Nhân Chờ Khám ({formatDate(currentDate)})
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-blue-500 mr-2" />
              <span>Đang tải danh sách bệnh nhân...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ Đăng Ký
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giới Tính
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm Sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số Điện Thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa Chỉ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patientList.length > 0 ? (
                    patientList.map((patient, index) => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.registrationTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(patient.dateOfBirth).getFullYear()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleSelectForExam(patient)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Lập phiếu khám bệnh"
                          >
                            <FaStethoscope />
                          </button>
                          <button
                            onClick={() => handleEditPatient(patient.id!)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            disabled={loading}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id!)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        Chưa có bệnh nhân trong danh sách chờ khám
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Chỉnh sửa thông tin bệnh nhân
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPatient(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    value={editingPatient.name}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        name: e.target.value,
                      })
                    }
                    disabled={savingPatient}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới Tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={editingPatient.gender}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        gender: e.target.value,
                      })
                    }
                    disabled={savingPatient}
                  >
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded"
                    value={editingPatient.dateOfBirth}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        dateOfBirth: e.target.value,
                      })
                    }
                    disabled={savingPatient}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded"
                    value={editingPatient.phoneNumber}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="0xxxxxxxxx"
                    disabled={savingPatient}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa Chỉ
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    value={editingPatient.address}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        address: e.target.value,
                      })
                    }
                    disabled={savingPatient}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPatient(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={savingPatient}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={savingPatient}
                >
                  {savingPatient ? (
                    <>
                      <FaSpinner className="inline mr-1 animate-spin" /> Đang
                      lưu...
                    </>
                  ) : (
                    <>
                      <FaSave className="inline mr-1" /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
