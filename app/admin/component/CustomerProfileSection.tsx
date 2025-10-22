"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "../types/customer";
import { InspectionFormData } from "../types/inspection";
import { FileUploadComponent } from "./file-upload/FileUploadComponent";
import toast from "react-hot-toast";

interface CustomerProfileSectionProps {
  customer: Customer | null;
  dossierId: number | null;
  formData: InspectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<InspectionFormData>>;
  onSubmit: () => void;
  loading: boolean;
  onUploadSuccess?: (data: any) => void;
  onRelatedCustomerCreated?: (customerId: number) => void;
  uploadMode?: "create" | "update";
}

interface CustomerUpdateData {
  name: string;
  address: string;
  email: string;
  dob: string;
  phone: string;
  taxCode: string;
  note: string;
  customerType: "SERVICE_MANAGER" | "IMPORTER";
}

const customerTypeOptions = [
  { value: "SERVICE_MANAGER", label: "Người quản lý dịch vụ" },
  { value: "IMPORTER", label: "Nhà nhập khẩu" },
];

export const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({
  customer,
  dossierId,
  onUploadSuccess,
  uploadMode = "update",
}) => {
  // Inspection type selection removed from Section 1
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Customer editing states
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerUpdateLoading, setCustomerUpdateLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerUpdateData | null>(
    null
  );
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(
    customer
  );

  const isCreateUpload = uploadMode === "create";

  // Initialize customer data when customer prop changes
  useEffect(() => {
    if (customer) {
      setCustomerData({
        name: customer.name,
        address: customer.address,
        email: customer.email,
        dob: customer.dob || "",
        phone: customer.phone,
        taxCode: customer.taxCode || "",
        note: customer.note || "",
        customerType: customer.customerType as "SERVICE_MANAGER" | "IMPORTER",
      });
      setUpdatedCustomer(customer);
    }
  }, [customer]);

  // Removed fetching inspection types

  const handleCustomerDataChange = (
    field: keyof CustomerUpdateData,
    value: string
  ) => {
    setCustomerData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  // No inspection type selection in this section

  const handleUploadSuccess = (data: any) => {
    if (onUploadSuccess) {
      onUploadSuccess(data);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!customerData || !updatedCustomer) return;

    setCustomerUpdateLoading(true);
    try {
      const response = await fetch(
        `/api/customers/${updatedCustomer.customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin khách hàng");
      }

      const updatedCustomerResponse: Customer = await response.json();
      setUpdatedCustomer(updatedCustomerResponse);
      setEditingCustomer(false);
      setError(null);

      // Show success message
      toast.success("Cập nhật thông tin khách hàng thành công!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi cập nhật thông tin khách hàng"
      );
    } finally {
      setCustomerUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (updatedCustomer) {
      setCustomerData({
        name: updatedCustomer.name,
        address: updatedCustomer.address,
        email: updatedCustomer.email,
        dob: updatedCustomer.dob || "",
        phone: updatedCustomer.phone,
        taxCode: updatedCustomer.taxCode || "",
        note: updatedCustomer.note || "",
        customerType: updatedCustomer.customerType as
          | "SERVICE_MANAGER"
          | "IMPORTER",
      });
    }
    setEditingCustomer(false);
    setError(null);
  };

  // Show upload form if requested
  if (showUploadForm) {
    return (
      <FileUploadComponent
        dossierId={dossierId ?? null}
        onUploadSuccess={handleUploadSuccess}
        onCancel={() => setShowUploadForm(false)}
        loading={uploadLoading}
        setLoading={setUploadLoading}
        mode={uploadMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
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
            Vui lòng kiểm tra và cập nhật thông tin khách hàng nếu cần thiết
          </p>
        </div>

        {/* Upload Option moved to bottom */}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-3"
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
              <span className="text-red-800 font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Current Customer Info */}
        {updatedCustomer && customerData && (
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 lg:p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
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
                <h3 className="text-xl font-bold text-blue-500">
                  Thông tin khách hàng
                </h3>
              </div>

              {!editingCustomer && (
                <button
                  onClick={() => setEditingCustomer(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>

            {editingCustomer ? (
              // Edit Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) =>
                        handleCustomerDataChange("name", e.target.value)
                      }
                      className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) =>
                        handleCustomerDataChange("phone", e.target.value)
                      }
                      className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        handleCustomerDataChange("email", e.target.value)
                      }
                      className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                  </div>
{/* 
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={customerData.dob}
                      onChange={(e) =>
                        handleCustomerDataChange("dob", e.target.value)
                      }
                      className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div> */}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={customerData.taxCode}
                      onChange={(e) =>
                        handleCustomerDataChange("taxCode", e.target.value)
                      }
                      className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Loại khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={customerData.customerType}
                      onChange={(e) =>
                        handleCustomerDataChange("customerType", e.target.value)
                      }
                      className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    >
                      {customerTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) =>
                      handleCustomerDataChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ghi chú
                  </label>
                  <textarea
                    value={customerData.note}
                    onChange={(e) =>
                      handleCustomerDataChange("note", e.target.value)
                    }
                    rows={2}
                    className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Nhập ghi chú về khách hàng..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancelEdit}
                    disabled={customerUpdateLoading}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    disabled={
                      customerUpdateLoading ||
                      !customerData.name ||
                      !customerData.phone ||
                      !customerData.email ||
                      !customerData.address
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {customerUpdateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Cập nhật
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-white to-blue-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <span className="text-gray-900 font-bold text-base">
                    {updatedCustomer.name}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-white to-green-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <span className="text-gray-900 font-bold text-base">
                    {updatedCustomer.phone}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <span className="text-blue-600 text-base italic">
                    {updatedCustomer.email}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-white to-yellow-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng
                  </label>
                  <span className="text-gray-900 font-semibold text-base">
                    {updatedCustomer.customerType === "IMPORTER"
                      ? "Nhà nhập khẩu"
                      : updatedCustomer.customerType === "SERVICE_MANAGER"
                      ? "Quản lý dịch vụ"
                      : updatedCustomer.customerType}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-white to-indigo-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã số thuế
                  </label>
                  <span className="text-gray-900 font-semibold text-base">
                    {updatedCustomer.taxCode || "Chưa có"}
                  </span>
                </div>

                {/* <div className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <span className="text-gray-900 font-semibold text-base">
                    {updatedCustomer.dob
                      ? new Date(updatedCustomer.dob).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Chưa có"}
                  </span>
                </div> */}

                <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <span className="text-gray-900 font-semibold text-base">
                    {updatedCustomer.address || "Chưa có"}
                  </span>
                </div>

                {updatedCustomer.note && (
                  <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <span className="text-gray-900 font-light italic text-base">
                      {updatedCustomer.note || "Chưa có"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Option (stays at the very end) */}
        <div className="bg-gradient-to-r from-orange-100 via-yellow-100 to-amber-100 rounded-2xl shadow-xl border border-orange-200 p-6 lg:p-8 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-800">
                  Tùy Chọn Nhanh
                </h3>
                <p className="text-orange-700 font-medium">
                  Upload file Excel/CSV để tạo hồ sơ tự động
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!dossierId && !isCreateUpload) {
                  toast.error(
                    "Không xác định được hồ sơ cần cập nhật từ file."
                  );
                  return;
                }
                setShowUploadForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Tải lên file
            </button>
          </div>
          <p className="text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
            <strong>Mẹo:</strong> Sử dụng tính năng upload để tạo hồ sơ nhanh
            chóng từ file dữ liệu có sẵn. Hệ thống sẽ tự động xử lý và tạo biên
            nhận cùng thông tin máy móc.
          </p>
        </div>
      </div>
    </div>
  );
};
