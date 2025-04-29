"use client";

import { useState } from "react";
import { FaSearch, FaFileMedical, FaFileInvoiceDollar } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { formatDate, calculateAge } from "@/utils/helpers";

interface Patient {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  address: string;
}

interface Examination {
  id: string;
  patientId: string;
  patientName: string;
  examDate: string;
  symptoms: string;
  diagnosis: string;
  medicines: Array<{
    id: string;
    name: string;
    unit: string;
    quantity: number;
    usage: string;
  }>;
}

export default function PatientSearchPage() {
  // Mock data - in a real app, these would come from a database
  const [patients] = useState<Patient[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      gender: "Nam",
      dateOfBirth: "1985-05-15",
      phone: "0901234567",
      address: "123 Đường ABC, Quận XYZ, TP.HCM",
    },
    {
      id: "2",
      name: "Trần Thị B",
      gender: "Nữ",
      dateOfBirth: "1990-10-20",
      phone: "0912345678",
      address: "456 Đường DEF, Quận UVW, TP.HCM",
    },
  ]);

  const [examinations] = useState<Examination[]>([
    {
      id: "1",
      patientId: "1",
      patientName: "Nguyễn Văn A",
      examDate: "2023-11-10",
      symptoms: "Sốt cao, đau họng",
      diagnosis: "Viêm họng cấp",
      medicines: [
        {
          id: "1",
          name: "Paracetamol",
          unit: "Viên",
          quantity: 20,
          usage: "Uống 1 viên khi sốt trên 38.5 độ, ngày không quá 3 viên",
        },
        {
          id: "2",
          name: "Amoxicillin",
          unit: "Viên",
          quantity: 20,
          usage: "Uống 1 viên sau ăn, ngày 2 lần sáng-tối",
        },
      ],
    },
    {
      id: "2",
      patientId: "1",
      patientName: "Nguyễn Văn A",
      examDate: "2023-12-15",
      symptoms: "Ho khan, sổ mũi",
      diagnosis: "Viêm mũi dị ứng",
      medicines: [
        {
          id: "3",
          name: "Cetirizine",
          unit: "Viên",
          quantity: 10,
          usage: "Uống 1 viên sau ăn tối",
        },
      ],
    },
    {
      id: "3",
      patientId: "2",
      patientName: "Trần Thị B",
      examDate: "2024-01-05",
      symptoms: "Đau bụng, buồn nôn",
      diagnosis: "Viêm dạ dày",
      medicines: [
        {
          id: "4",
          name: "Omeprazole",
          unit: "Viên",
          quantity: 14,
          usage: "Uống 1 viên trước ăn sáng",
        },
        {
          id: "5",
          name: "Mebeverine",
          unit: "Viên",
          quantity: 30,
          usage: "Uống 1 viên trước ăn, ngày 3 lần",
        },
      ],
    },
  ]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientExaminations, setPatientExaminations] = useState<Examination[]>(
    []
  );
  const [activeExamination, setActiveExamination] =
    useState<Examination | null>(null);

  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    );

    setSearchResults(results);
    setSelectedPatient(null);
    setPatientExaminations([]);
    setActiveExamination(null);
  };

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);

    // Find examinations for this patient
    const examHistory = examinations.filter(
      (exam) => exam.patientId === patient.id
    );

    setPatientExaminations(examHistory);
    setActiveExamination(examHistory.length > 0 ? examHistory[0] : null);
  };

  // Handle examination selection
  const handleSelectExamination = (examination: Examination) => {
    setActiveExamination(examination);
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
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                  onClick={handleSearch}
                >
                  <FaSearch className="inline mr-1" /> Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && !selectedPatient && (
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
                        {patient.phone}
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
                    {selectedPatient.phone}
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
                {patientExaminations.length > 0 ? (
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

                  <div className="text-right">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      <FaPrint className="inline mr-1" /> In phiếu khám
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-64">
                  <p className="text-gray-500">
                    {patientExaminations.length > 0
                      ? "Chọn một lần khám để xem chi tiết"
                      : "Không có dữ liệu khám bệnh"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No results message */}
        {searchTerm && searchResults.length === 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-center text-gray-500">
              Không tìm thấy bệnh nhân phù hợp với từ khóa "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
