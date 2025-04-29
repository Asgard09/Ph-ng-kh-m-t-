"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileMedical,
  FaFileInvoiceDollar,
  FaPrint,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { formatDate, calculateAge } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import * as firebaseService from "@/services/firebaseService";
import type { Patient, Examination } from "@/services/firebaseService";

export default function PatientSearchPage() {
  const router = useRouter();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientExaminations, setPatientExaminations] = useState<Examination[]>(
    []
  );
  const [activeExamination, setActiveExamination] =
    useState<Examination | null>(null);

  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingExaminations, setIsLoadingExaminations] = useState(false);
  const [isLoadingAllExaminations, setIsLoadingAllExaminations] =
    useState(false);

  // All examinations for display
  const [allExaminations, setAllExaminations] = useState<Examination[]>([]);

  // Load all examinations when page loads
  useEffect(() => {
    const loadAllExaminations = async () => {
      setIsLoadingAllExaminations(true);
      try {
        const examinations = await firebaseService.getAllExaminations();
        setAllExaminations(examinations);
        console.log("Loaded all examinations:", examinations.length);
      } catch (error) {
        console.error("Error loading examinations:", error);
      } finally {
        setIsLoadingAllExaminations(false);
      }
    };

    loadAllExaminations();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await firebaseService.searchPatients(searchTerm);
      setSearchResults(results);
      setSelectedPatient(null);
      setPatientExaminations([]);
      setActiveExamination(null);
    } catch (error) {
      console.error("Error searching patients:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle patient selection
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoadingExaminations(true);

    try {
      // Get examinations for this patient
      const examHistory = await firebaseService.getExaminationsByPatient(
        patient.id || ""
      );
      setPatientExaminations(examHistory);
      setActiveExamination(examHistory.length > 0 ? examHistory[0] : null);
    } catch (error) {
      console.error("Error loading patient examinations:", error);
      setPatientExaminations([]);
      setActiveExamination(null);
    } finally {
      setIsLoadingExaminations(false);
    }
  };

  // Handle examination selection
  const handleSelectExamination = (examination: Examination) => {
    setActiveExamination(examination);
  };

  // Handle view examination in examination form page
  const handleViewExaminationDetails = (examination: Examination) => {
    if (typeof window !== "undefined") {
      // Store the selected examination in sessionStorage
      sessionStorage.setItem(
        "selectedExamination",
        JSON.stringify(examination)
      );

      // If you also need the patient details
      if (selectedPatient) {
        sessionStorage.setItem(
          "selectedPatient",
          JSON.stringify(selectedPatient)
        );
      }

      // Navigate to the examination form page
      router.push("/medical/examination-form");
    }
  };

  return (
    <DashboardLayout title="Tra cứu bệnh nhân">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tra Cứu Bệnh Nhân</h1>

        {/* Search bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm bệnh nhân (theo tên hoặc số điện thoại)
              </label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border rounded-l"
                  placeholder="Nhập tên hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 flex items-center"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <FaSpinner className="inline mr-1 animate-spin" />
                  ) : (
                    <FaSearch className="inline mr-1" />
                  )}{" "}
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search results */}
        {isSearching && (
          <div className="bg-white p-6 rounded-lg shadow mb-6 text-center">
            <FaSpinner className="inline-block animate-spin text-blue-500 text-2xl" />
            <p className="mt-2 text-gray-600">Đang tìm kiếm bệnh nhân...</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && !selectedPatient && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Kết quả tìm kiếm</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giới tính
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((patient, index) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index + 1}
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
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patient details */}
        {selectedPatient && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient info */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">
                  Thông tin bệnh nhân
                </h2>
                <div className="space-y-3">
                  <p>
                    <span className="font-medium">Họ tên:</span>{" "}
                    {selectedPatient.name}
                  </p>
                  <p>
                    <span className="font-medium">Giới tính:</span>{" "}
                    {selectedPatient.gender}
                  </p>
                  <p>
                    <span className="font-medium">Ngày sinh:</span>{" "}
                    {formatDate(selectedPatient.dateOfBirth)}
                  </p>
                  <p>
                    <span className="font-medium">Tuổi:</span>{" "}
                    {calculateAge(selectedPatient.dateOfBirth)}
                  </p>
                  <p>
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {selectedPatient.phoneNumber}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {selectedPatient.address}
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  <Link
                    href="/medical/examination-form"
                    className="block text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(
                          "selectedPatient",
                          JSON.stringify(selectedPatient)
                        );
                      }
                    }}
                  >
                    <FaFileMedical className="inline mr-1" /> Lập phiếu khám mới
                  </Link>
                  <Link
                    href="/medical/invoice"
                    className="block text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FaFileInvoiceDollar className="inline mr-1" /> Lập hóa đơn
                  </Link>
                </div>
              </div>

              {/* Examination history */}
              <div className="bg-white p-4 rounded-lg shadow mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Lịch sử khám bệnh
                </h2>
                {isLoadingExaminations ? (
                  <div className="flex justify-center py-6">
                    <FaSpinner className="animate-spin text-blue-500 text-xl" />
                  </div>
                ) : patientExaminations.length > 0 ? (
                  <div className="space-y-2">
                    {patientExaminations.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3 rounded cursor-pointer ${
                          activeExamination?.id === exam.id
                            ? "bg-blue-100 border border-blue-300"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => handleSelectExamination(exam)}
                      >
                        <p className="font-medium">
                          {formatDate(exam.examDate)}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {exam.diagnosis}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Không có lịch sử khám bệnh
                  </p>
                )}
              </div>
            </div>

            {/* Examination details */}
            <div className="md:col-span-2">
              {activeExamination ? (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">
                    Chi tiết khám bệnh -{" "}
                    {formatDate(activeExamination.examDate)}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-700">Triệu chứng</h3>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {activeExamination.symptoms}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Chẩn đoán</h3>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {activeExamination.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Đơn thuốc
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              STT
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên thuốc
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Đơn vị
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cách dùng
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeExamination.medicines.map(
                            (medicine, index) => (
                              <tr key={medicine.id}>
                                <td className="px-4 py-2">{index + 1}</td>
                                <td className="px-4 py-2">{medicine.name}</td>
                                <td className="px-4 py-2">{medicine.unit}</td>
                                <td className="px-4 py-2">
                                  {medicine.quantity}
                                </td>
                                <td className="px-4 py-2">{medicine.usage}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="text-right flex justify-end space-x-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() =>
                        handleViewExaminationDetails(activeExamination)
                      }
                    >
                      <FaEye className="inline mr-1" /> Xem chi tiết phiếu khám
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      <FaPrint className="inline mr-1" /> In phiếu khám
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-64">
                  <p className="text-gray-500">
                    {isLoadingExaminations
                      ? "Đang tải dữ liệu khám bệnh..."
                      : patientExaminations.length > 0
                      ? "Chọn một lần khám để xem chi tiết"
                      : "Không có dữ liệu khám bệnh"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Examinations */}
        {!selectedPatient && !searchResults.length && !isSearching && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Phiếu khám gần đây</h2>

            {isLoadingAllExaminations ? (
              <div className="flex justify-center py-6">
                <FaSpinner className="animate-spin text-blue-500 text-xl" />
                <p className="ml-2 text-gray-600">
                  Đang tải dữ liệu khám bệnh...
                </p>
              </div>
            ) : allExaminations.length > 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allExaminations.map((exam, index) => (
                      <tr key={exam.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(exam.examDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.diagnosis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.medicines.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleViewExaminationDetails(exam)}
                          >
                            <FaEye className="inline mr-1" /> Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Chưa có phiếu khám nào được lưu
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-center text-gray-500">
              Không tìm thấy bệnh nhân phù hợp với từ khóa &ldquo;{searchTerm}
              &rdquo;
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
