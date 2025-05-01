"use client";

import { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { useRegulations } from "@/context/RegulationsContext";
import { updateRegulations } from "@/utils/regulationsService";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RegulationsPage() {
  const {
    regulations: savedRegulations,
    loading: isContextLoading,
    refreshRegulations,
  } = useRegulations();

  const [formValues, setFormValues] = useState({
    maxPatientsPerDay: savedRegulations.maxPatientsPerDay,
    consultationFee: savedRegulations.consultationFee,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Update form values when context values change
  useEffect(() => {
    if (!isContextLoading) {
      setFormValues({
        maxPatientsPerDay: savedRegulations.maxPatientsPerDay,
        consultationFee: savedRegulations.consultationFee,
      });
    }
  }, [savedRegulations, isContextLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: parseInt(value, 10),
    });
  };

  const saveRegulations = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // Use the regulations service to update
      const success = await updateRegulations(formValues);

      if (success) {
        // Refresh regulations context
        await refreshRegulations();

        setMessage({
          text: "Đã lưu quy định thành công",
          type: "success",
        });
      } else {
        throw new Error("Không thể lưu quy định");
      }
    } catch (error) {
      console.error("Error saving regulations:", error);
      setMessage({
        text: "Lỗi khi lưu quy định. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading) {
    return (
      <DashboardLayout title="Quản lý quy định">
        <div className="p-8">
          <div className="animate-pulse bg-gray-200 h-8 w-1/3 mb-8 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quản lý quy định">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Quản lý quy định</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <label
                  htmlFor="maxPatientsPerDay"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Thay đổi số lượng bệnh nhân tối đa trong ngày
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    id="maxPatientsPerDay"
                    name="maxPatientsPerDay"
                    value={formValues.maxPatientsPerDay}
                    onChange={handleInputChange}
                    min="1"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="w-20 h-12 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    <span>{formValues.maxPatientsPerDay}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="consultationFee"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Thay đổi tiền khám
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    id="consultationFee"
                    name="consultationFee"
                    value={formValues.consultationFee}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="w-20 h-12 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    <span>
                      {formValues.consultationFee.toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={saveRegulations}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Lưu quy định
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
