"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FaUserInjured,
  FaClipboardList,
  FaMoneyBillWave,
} from "react-icons/fa";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalExaminations: 0,
    monthlyRevenue: 0,
  });

  // Simulate loading data
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setStats({
      totalPatients: 125,
      totalExaminations: 243,
      monthlyRevenue: 12500000,
    });
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
            <div>
              <p className="text-sm text-gray-500">Tổng số bệnh nhân</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPatients}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số lượt khám</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalExaminations}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <FaMoneyBillWave className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(stats.monthlyRevenue)}
              </p>
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

          <Link href="/medical/reports" className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Báo cáo tháng</h3>
              <p className="text-gray-600">
                Xem báo cáo doanh thu và sử dụng thuốc
              </p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
