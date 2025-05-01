"use client";

import { useState, useEffect } from "react";
import { FaChartBar, FaPills } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, formatDate, getCurrentMonth } from "@/utils/helpers";
import * as firebaseService from "@/services/firebaseService";
import type { Examination, Invoice } from "@/services/firebaseService";

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
  const [loading, setLoading] = useState<boolean>(false);

  // State for real data
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [medicineUsage, setMedicineUsage] = useState<MedicineUsage[]>([]);

  // Load data when month changes
  useEffect(() => {
    loadReportData();
  }, [currentMonth]); // Re-run when month changes

  // Load report data from Firebase
  const loadReportData = async () => {
    setLoading(true);
    try {
      // Parse month value (format: YYYY-MM)
      const [year, month] = currentMonth.split("-").map(Number);

      // Get first and last day of selected month
      const firstDay = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const lastDay = new Date(year, month, 0).toISOString().slice(0, 10);

      console.log(`Loading report data from ${firstDay} to ${lastDay}`);

      // Fetch all invoices
      const allInvoices = await firebaseService.getAllInvoices();

      // Filter invoices for selected month
      const monthInvoices = allInvoices.filter((invoice) => {
        const invoiceDate = invoice.examDate;
        return invoiceDate >= firstDay && invoiceDate <= lastDay;
      });

      console.log(`Found ${monthInvoices.length} invoices for selected month`);

      // Process revenue data
      processRevenueData(monthInvoices, firstDay, lastDay);

      // Fetch all examinations to get medicine usage
      const allExaminations = await firebaseService.getAllExaminations();

      // Filter examinations for selected month
      const monthExaminations = allExaminations.filter((exam) => {
        const examDate = exam.examDate;
        return examDate >= firstDay && examDate <= lastDay;
      });

      console.log(
        `Found ${monthExaminations.length} examinations for selected month`
      );

      // Process medicine usage data
      processMedicineData(monthExaminations);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process revenue data
  const processRevenueData = (
    invoices: Invoice[],
    startDate: string,
    endDate: string
  ) => {
    // Create map for daily revenue
    const dailyMap = new Map<
      string,
      { patientCount: number; revenue: number }
    >();

    // Initialize all days in the range
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      const dateStr = day.toISOString().slice(0, 10);
      dailyMap.set(dateStr, { patientCount: 0, revenue: 0 });
    }

    // Aggregate invoice data by date
    invoices.forEach((invoice) => {
      const date = invoice.examDate;
      const current = dailyMap.get(date) || { patientCount: 0, revenue: 0 };

      dailyMap.set(date, {
        patientCount: current.patientCount + 1,
        revenue: current.revenue + invoice.totalAmount,
      });
    });

    // Calculate total revenue for percentage
    const totalRevenue = Array.from(dailyMap.values()).reduce(
      (sum, day) => sum + day.revenue,
      0
    );

    // Convert map to array and calculate percentages
    const revenueData: DailyRevenue[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        patientCount: data.patientCount,
        revenue: data.revenue,
        percentage:
          totalRevenue > 0
            ? Math.round((data.revenue / totalRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

    setDailyRevenue(revenueData);
  };

  // Process medicine usage data
  const processMedicineData = (examinations: Examination[]) => {
    // Map to track medicine usage
    const medicineMap = new Map<
      string,
      {
        name: string;
        unit: string;
        quantity: number;
        usageCount: number;
      }
    >();

    // Process all medicines from examinations
    examinations.forEach((exam) => {
      if (exam.medicines && Array.isArray(exam.medicines)) {
        exam.medicines.forEach((medicine) => {
          if (!medicine || !medicine.id) return; // Skip if medicine or id is missing

          const medicineId = medicine.id;
          const current = medicineMap.get(medicineId) || {
            name: medicine.name || "Không tên",
            unit: medicine.unit || "Không đơn vị",
            quantity: 0,
            usageCount: 0,
          };

          medicineMap.set(medicineId, {
            ...current,
            name: medicine.name || current.name,
            unit: medicine.unit || current.unit,
            quantity: current.quantity + (Number(medicine.quantity) || 0),
            usageCount: current.usageCount + 1,
          });
        });
      }
    });

    // Convert map to array and filter out invalid entries
    const medicineData: MedicineUsage[] = Array.from(medicineMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        usageCount: data.usageCount,
      }))
      .filter((medicine) => medicine.name && medicine.unit) // Filter out entries without name or unit
      .sort((a, b) => b.quantity - a.quantity); // Sort by quantity (descending)

    setMedicineUsage(medicineData);
  };

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
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p>Đang tải dữ liệu báo cáo...</p>
            </div>
          ) : (
            <>
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
                        {dailyRevenue.length > 0
                          ? formatCurrency(
                              calculateTotalRevenue() / dailyRevenue.length
                            )
                          : formatCurrency(0)}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold mb-4">
                    Doanh thu theo ngày tháng {currentMonth}
                  </h2>
                  {dailyRevenue.length > 0 ? (
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
                                  <span className="ml-2">
                                    {day.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        Không có dữ liệu doanh thu cho tháng này
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Medicine Usage Report */}
              {activeReportTab === 2 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Báo cáo sử dụng thuốc tháng {currentMonth}
                  </h2>
                  {medicineUsage.length > 0 ? (
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
                            const percentage =
                              totalUsage > 0
                                ? Math.round(
                                    (medicine.quantity / totalUsage) * 100
                                  )
                                : 0;

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
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        Không có dữ liệu sử dụng thuốc cho tháng này
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
