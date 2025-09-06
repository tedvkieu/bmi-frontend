"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "../types/customer";
import { InspectionFormData } from "../types/inspection";

interface CustomerProfileSectionProps {
  customer: Customer | null;
  formData: InspectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<InspectionFormData>>;
  onSubmit: () => void;
  loading: boolean;
}

interface InspectionType {
  inspectionTypeId: string;
  name: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

const objectTypeOptions = [
  { value: "SERVICE_MANAGER", label: "Người quản lý dịch vụ" },
  { value: "IMPORTER", label: "Nhà nhập khẩu" },
];

export const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({
  customer,
  formData,
  setFormData,
  onSubmit,
  loading,
}) => {
  const [inspectionTypes, setInspectionTypes] = useState<InspectionType[]>([]);
  const [inspectionTypesLoading, setInspectionTypesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspectionTypes = async () => {
      setInspectionTypesLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "http://localhost:3000/api/inspection-types"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch inspection types");
        }
        const data: InspectionType[] = await response.json();
        setInspectionTypes(data);
      } catch (err) {
        setError("Không thể tải danh sách loại hình giám định");
        console.error("Error fetching inspection types:", err);
      } finally {
        setInspectionTypesLoading(false);
      }
    };

    fetchInspectionTypes();
  }, []);

  const handleInputChange = (
    field: keyof InspectionFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid = () => {
    return (
      formData.serviceAddress.trim() !== "" &&
      formData.taxCode.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.inspectionTypeId.trim() !== ""
    );
  };

  const selectedInspectionType = inspectionTypes.find(
    (type) => type.inspectionTypeId === formData.inspectionTypeId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Thông Tin Hồ Sơ Khách Hàng
          </h1>
          <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Vui lòng điền đầy đủ thông tin để hoàn thành hồ sơ khách hàng
          </p>
        </div>

        {/* Current Customer Info */}
        {customer && (
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 lg:p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                Thông tin khách hàng hiện tại
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-gradient-to-r from-white to-blue-50 rounded-lg p-3 shadow-sm transition-all duration-200 border border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tên khách hàng
                </label>
                <span className="text-gray-900 font-semibold text-sm">
                  {customer.name}
                </span>
              </div>

              <div className="bg-gradient-to-r from-white to-green-50 rounded-lg p-3 shadow-sm transition-all duration-200 border border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <span className="text-gray-900 font-semibold text-sm">
                  {customer.phone}
                </span>
              </div>

              <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-3 shadow-sm transition-all duration-200 border border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <span className="text-gray-900 font-semibold text-sm">
                  {customer.address}
                </span>
              </div>

              <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-3 shadow-sm transition-all duration-200 border border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Đối tượng
                </label>
                <span className="text-gray-900 font-semibold text-sm">
                  {customer.customerType === "IMPORTER"
                    ? "Nhà nhập khẩu"
                    : customer.customerType === "SERVICE_MANAGER"
                    ? "Quản lý dịch vụ"
                    : customer.customerType}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Profile Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                Thông tin chi tiết
              </h3>
              <p className="text-gray-700 font-medium mt-1">
                Điền các thông tin cần thiết cho hồ sơ
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="serviceAddress"
                  className="block text-xs font-medium text-gray-700"
                >
                  Địa chỉ dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="serviceAddress"
                  className="w-full text-sm text-gray-800 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm placeholder-gray-400"
                  value={formData.serviceAddress}
                  onChange={(e) =>
                    handleInputChange("serviceAddress", e.target.value)
                  }
                  placeholder="Nhập địa chỉ dịch vụ"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="taxCode"
                  className="block text-xs font-medium text-gray-700"
                >
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="taxCode"
                  className="w-full text-sm text-gray-800 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm placeholder-gray-400"
                  value={formData.taxCode}
                  onChange={(e) => handleInputChange("taxCode", e.target.value)}
                  placeholder="Nhập mã số thuế"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full text-sm text-gray-800 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm placeholder-gray-400"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Inspection Type Selection */}
        <div className="bg-gradient-to-r from-white via-green-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                Loại hình giám định <span className="text-red-500">*</span>
              </h3>
              <p className="text-gray-700 font-medium mt-1">
                Chọn loại hình giám định phù hợp với nhu cầu của bạn
              </p>
            </div>
          </div>

          {inspectionTypesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-800 font-semibold text-lg">
                  Đang tải danh sách...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-red-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-red-800 font-semibold">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {inspectionTypes.map((inspectionType) => (
                  <div
                    key={inspectionType.inspectionTypeId}
                    className={`relative rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      formData.inspectionTypeId ===
                      inspectionType.inspectionTypeId
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md"
                    }`}
                    onClick={() =>
                      handleInputChange(
                        "inspectionTypeId",
                        inspectionType.inspectionTypeId
                      )
                    }
                  >
                    <div className="p-6">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`inspection-${inspectionType.inspectionTypeId}`}
                          name="inspectionType"
                          value={inspectionType.inspectionTypeId}
                          checked={
                            formData.inspectionTypeId ===
                            inspectionType.inspectionTypeId
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "inspectionTypeId",
                              e.target.value
                            )
                          }
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-4 flex-1">
                          <label
                            htmlFor={`inspection-${inspectionType.inspectionTypeId}`}
                            className="block text-base font-bold text-gray-900 cursor-pointer"
                          >
                            {inspectionType.name}
                          </label>
                          <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">
                            {inspectionType.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedInspectionType && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-xl shadow-sm">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-3 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-base font-bold text-blue-900">
                        Đã chọn: {selectedInspectionType.name}
                      </h4>
                      <p className="text-sm text-blue-800 mt-2 font-medium leading-relaxed">
                        {selectedInspectionType.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !isFormValid() || inspectionTypesLoading}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              loading || !isFormValid() || inspectionTypesLoading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-105 shadow-xl hover:shadow-2xl"
            } min-w-[280px]`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Đang xử lý...
              </div>
            ) : (
              "Hoàn thành hồ sơ khách hàng"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
