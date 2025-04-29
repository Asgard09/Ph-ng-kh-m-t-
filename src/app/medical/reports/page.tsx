"use client";

import { useState } from "react";
import { FaChartBar, FaPrint, FaFileExport, FaPills } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, formatDate, getCurrentMonth } from "@/utils/helpers";

interface DailyRevenue {
  date: string;
  patientCount: number;
  revenue: number;
  percentage: number;
}

interface MedicineUsage {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  usageCount: number;
}

export default function ReportsPage() {
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
  const [activeReportTab, setActiveReportTab] = useState<number>(1); // 1: Revenue, 2: Medicine

  // Mock data for daily revenue
  const [dailyRevenue] = useState<DailyRevenue[]>([
    { date: "2023-05-01", patientCount: 10, revenue: 5000000, percentage: 20 },
    { date: "2023-05-02", patientCount: 15, revenue: 7500000, percentage: 30 },
    { date: "2023-05-03", patientCount: 8, revenue: 4000000, percentage: 16 },
    { date: "2023-05-04", patientCount: 12, revenue: 6000000, percentage: 24 },
    { date: "2023-05-05", patientCount: 5, revenue: 2500000, percentage: 10 },
  ]);

  // Mock data for medicine usage
  const [medicineUsage] = useState<MedicineUsage[]>([
    {
      id: "1",
      name: "Paracetamol",
      unit: "Viên",
      quantity: 120,
      usageCount: 18,
    },
    {
      id: "2",
      name: "Amoxicillin",
      unit: "Viên",
      quantity: 90,
      usageCount: 12,
    },
    { id: "3", name: "Omeprazole", unit: "Viên", quantity: 60, usageCount: 8 },
    { id: "4", name: "Cetirizine", unit: "Viên", quantity: 45, usageCount: 6 },
    { id: "5", name: "Vitamin C", unit: "Viên", quantity: 150, usageCount: 20 },
  ]);

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    return dailyRevenue.reduce((total, day) => total + day.revenue, 0);
  };

  // Calculate total patients
  const calculateTotalPatients = () => {
    return dailyRevenue.reduce((total, day) => total + day.patientCount, 0);
  };

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
  };

  // Handle print report
  const handlePrintReport = () => {
    alert("Chức năng in báo cáo sẽ được phát triển sau");
  };

  // Handle export report
  const handleExportReport = () => {
    alert("Chức năng xuất báo cáo sẽ được phát triển sau");
  };

  return (
    <DashboardLayout title="Lập báo cáo tháng">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Báo Cáo Tháng</h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn tháng báo cáo
            </label>
            <input
              type="month"
              className="px-3 py-2 border rounded"
              value={currentMonth}
              onChange={handleMonthChange}
            />
          </div>

          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              onClick={handlePrintReport}
            >
              <FaPrint className="mr-2" /> In báo cáo
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              onClick={handleExportReport}
            >
              <FaFileExport className="mr-2" /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeReportTab === 1
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "hover:text-gray-600 hover:border-gray-300"
                }`}
                onClick={() => setActiveReportTab(1)}
              >
                <FaChartBar className="inline mr-2" />
                Báo cáo doanh thu theo ngày
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeReportTab === 2
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "hover:text-gray-600 hover:border-gray-300"
                }`}
                onClick={() => setActiveReportTab(2)}
              >
                <FaPills className="inline mr-2" />
                Báo cáo sử dụng thuốc
              </button>
            </li>
          </ul>
        </div>

        {/* Tab content */}
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Revenue Report */}
          {activeReportTab === 1 && (
            <div>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Tổng doanh thu
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(calculateTotalRevenue())}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">
                    Tổng số bệnh nhân
                  </p>
                  <p className="text-2xl font-bold">
                    {calculateTotalPatients()}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">
                    Trung bình mỗi ngày
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      calculateTotalRevenue() / dailyRevenue.length
                    )}
                  </p>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-4">
                Doanh thu theo ngày tháng {currentMonth}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số bệnh nhân
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tỷ lệ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyRevenue.map((day, index) => (
                      <tr key={day.date}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(day.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {day.patientCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${day.percentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2">{day.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medicine Usage Report */}
          {activeReportTab === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Báo cáo sử dụng thuốc tháng {currentMonth}
              </h2>
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
                        Số lượng sử dụng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lần kê đơn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tỷ lệ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicineUsage.map((medicine, index) => {
                      // Calculate the percentage of this medicine relative to total usage
                      const totalUsage = medicineUsage.reduce(
                        (total, med) => total + med.quantity,
                        0
                      );
                      const percentage = Math.round(
                        (medicine.quantity / totalUsage) * 100
                      );

                      return (
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
                            {medicine.usageCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
