"use client";

import { useState } from "react";
import { FaSearch, FaPrint, FaSave } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { medicalConfig } from "@/config";

interface Invoice {
  id: string;
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

interface Patient {
  id: string;
  name: string;
  phone: string;
}

export default function InvoicePage() {
  // Mock data - in a real app, these would come from a database
  const [patients] = useState<Patient[]>([
    { id: "1", name: "Nguyễn Văn A", phone: "0901234567" },
    { id: "2", name: "Trần Thị B", phone: "0912345678" },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1",
      patientId: "1",
      patientName: "Nguyễn Văn A",
      examDate: "2023-12-15",
      consultationFee: 150000,
      medicineFee: 350000,
      otherFees: 0,
      totalAmount: 500000,
      isPaid: true,
      paymentDate: "2023-12-15",
      paymentMethod: "Tiền mặt",
    },
    {
      id: "2",
      patientId: "2",
      patientName: "Trần Thị B",
      examDate: "2024-01-05",
      consultationFee: 150000,
      medicineFee: 420000,
      otherFees: 30000,
      totalAmount: 600000,
      isPaid: false,
    },
  ]);

  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<
    Omit<
      Invoice,
      "id" | "totalAmount" | "isPaid" | "paymentDate" | "paymentMethod"
    >
  >({
    patientId: "",
    patientName: "",
    examDate: new Date().toISOString().slice(0, 10),
    consultationFee: medicalConfig.defaultConsultationFee, // Using default fee from config
    medicineFee: 0,
    otherFees: 0,
  });

  // Handle search for patients
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
  };

  // Select a patient for invoice creation
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setInvoiceForm({
      ...invoiceForm,
      patientId: patient.id,
      patientName: patient.name,
    });
    setSearchResults([]);
    setSearchTerm("");
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
  const handleSaveInvoice = () => {
    if (!invoiceForm.patientId || !invoiceForm.examDate) {
      alert("Vui lòng điền đầy đủ thông tin hóa đơn");
      return;
    }

    const newInvoice: Invoice = {
      ...invoiceForm,
      id: Date.now().toString(),
      totalAmount: calculateTotal(),
      isPaid: false,
    };

    setInvoices([...invoices, newInvoice]);

    // Reset form
    setInvoiceForm({
      patientId: "",
      patientName: "",
      examDate: new Date().toISOString().slice(0, 10),
      consultationFee: medicalConfig.defaultConsultationFee,
      medicineFee: 0,
      otherFees: 0,
    });

    setSelectedPatient(null);

    alert("Đã lưu hóa đơn thành công!");
  };

  // Print the invoice
  const handlePrintInvoice = () => {
    if (!invoiceForm.patientId || !invoiceForm.examDate) {
      alert("Vui lòng điền đầy đủ thông tin hóa đơn");
      return;
    }

    alert("Chức năng in hóa đơn sẽ được phát triển sau");
  };

  // Mark invoice as paid
  const handleMarkAsPaid = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              isPaid: true,
              paymentDate: new Date().toISOString().slice(0, 10),
              paymentMethod: medicalConfig.paymentMethods[0], // Using first payment method from config
            }
          : invoice
      )
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
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
                  Bệnh nhân <span className="text-red-500">*</span>
                </label>

                {selectedPatient ? (
                  <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <div>
                      <p className="font-medium">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-600">
                        SĐT: {selectedPatient.phone}
                      </p>
                    </div>
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setSelectedPatient(null)}
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                        onClick={handleSearch}
                      >
                        <FaSearch className="inline mr-1" /> Tìm
                      </button>
                    </div>

                    {searchResults.length > 0 && (
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
                                <td className="px-4 py-2">{patient.phone}</td>
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
                  </div>
                )}
              </div>

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
                  <input
                    type="number"
                    name="medicineFee"
                    className="w-full px-3 py-2 border rounded"
                    value={invoiceForm.medicineFee}
                    onChange={handleInputChange}
                  />
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
                    disabled={!selectedPatient}
                  >
                    <FaSave className="mr-2" /> Lưu hóa đơn
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                    onClick={handlePrintInvoice}
                    disabled={!selectedPatient}
                  >
                    <FaPrint className="mr-2" /> In hóa đơn
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Hóa đơn gần đây</h2>

              {invoices.length > 0 ? (
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
                            onClick={() => handleMarkAsPaid(invoice.id)}
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
    </DashboardLayout>
  );
}
