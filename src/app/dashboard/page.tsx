"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FaUserInjured,
  FaClipboardList,
  FaMoneyBillWave,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";
import * as firebaseService from "@/services/firebaseService";
import { formatCurrency } from "@/utils/helpers";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalExaminations: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real data from Firestore
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get all patients
        const patients = await firebaseService.getAllPatients();

        // Get all examinations
        const examinations = await firebaseService.getAllExaminations();

        // Get all invoices
        const invoices = await firebaseService.getAllInvoices();

        // Calculate monthly revenue - current month only
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .slice(0, 10);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        )
          .toISOString()
          .slice(0, 10);

        const monthlyInvoices = invoices.filter(
          (invoice) =>
            invoice.examDate >= startOfMonth && invoice.examDate <= endOfMonth
        );

        const monthlyRevenue = monthlyInvoices.reduce(
          (total, invoice) => total + invoice.totalAmount,
          0
        );

        // Update stats
        setStats({
          totalPatients: patients.length,
          totalExaminations: examinations.length,
          monthlyRevenue: monthlyRevenue,
        });

        console.log("Dashboard data loaded:", {
          patients: patients.length,
          examinations: examinations.length,
          monthlyRevenue,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaUserInjured className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Tổng số bệnh nhân</p>
              {loading ? (
                <div className="flex items-center mt-1">
                  <FaSpinner className="animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-400">Đang tải...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPatients}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Tổng số lượt khám</p>
              {loading ? (
                <div className="flex items-center mt-1">
                  <FaSpinner className="animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-400">Đang tải...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalExaminations}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <FaMoneyBillWave className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Doanh thu tháng này</p>
              {loading ? (
                <div className="flex items-center mt-1">
                  <FaSpinner className="animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-400">Đang tải...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <h2 className="text-xl font-semibold mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/medical/examination-list" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                Lập danh sách khám bệnh
              </h3>
              <p className="text-gray-600">
                Thêm bệnh nhân mới vào danh sách chờ khám
              </p>
            </div>
          </Link>

          <Link href="/medical/examination-form" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                Lập phiếu khám bệnh
              </h3>
              <p className="text-gray-600">
                Tạo phiếu khám và kê đơn thuốc cho bệnh nhân
              </p>
            </div>
          </Link>

          <Link href="/medical/invoice" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Lập hóa đơn</h3>
              <p className="text-gray-600">
                Tạo hóa đơn thanh toán cho bệnh nhân
              </p>
            </div>
          </Link>

          <Link href="/medical/patient-search" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Tra cứu bệnh nhân</h3>
              <p className="text-gray-600">
                Tìm kiếm bệnh nhân và xem lịch sử khám
              </p>
            </div>
          </Link>

          <Link href="/medical/reports" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Báo cáo tháng</h3>
              <p className="text-gray-600">
                Xem báo cáo doanh thu và sử dụng thuốc
              </p>
            </div>
          </Link>

          <Link href="/medical/regulations" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Quy định</h3>
              <p className="text-gray-600">
                Thay đổi quy định về số lượng bệnh nhân và tiền khám
              </p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
