"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Building,
  FileText,
  ChevronLeft,
  Mail,
  MapPin,
  Hash,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import AdminLayout from "@/app/admin/component/AdminLayout";

// Types
type InspectionType = {
  inspectionTypeId: string;
  name: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type Customer = {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  customerType: "USER" | "BUSINESS";
};

type ObjectType = "SERVICE_MANAGER" | "PROPERTY_OWNER" | "LEGAL_REPRESENTATIVE";

type ProfileFormData = {
  customerId: number;
  serviceAddress: string;
  taxCode: string;
  email: string;
  objectType: ObjectType;
  inspectionTypeId?: string;
};

const CustomerProfileForm = () => {
  const params = useParams(); // Lấy params từ URL
  const { id } = params; // id là customerId
  const [customer, setCustomer] = useState<Customer>();

  // const [customer] = useState<Customer>({
  //   customerId: 1,
  //   name: "Nguyễn Văn An",
  //   email: "nguyen.van.an@example.com",
  //   phone: "0901234567",
  //   customerType: "USER",
  // });

  useEffect(() => {
    if (!id) return;
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch customer");
        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };

    fetchCustomer();
  }, [id]);

  // State for inspection types
  const [inspectionTypes, setInspectionTypes] = useState<InspectionType[]>([]);
  const [loadingInspectionTypes, setLoadingInspectionTypes] = useState(true);

  // Form data state
  const [formData, setFormData] = useState<ProfileFormData>({
    customerId: Number(id),
    serviceAddress: "",
    taxCode: "",
    email: customer?.email || "",
    objectType: "SERVICE_MANAGER",
    inspectionTypeId: "",
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch inspection types
  useEffect(() => {
    const fetchInspectionTypes = async () => {
      try {
        setLoadingInspectionTypes(true);
        const response = await fetch("/api/inspection-types", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch inspection types");
        }
        const data = await response.json();
        setInspectionTypes(data);
      } catch (error) {
        console.error("Error fetching inspection types:", error);
        // Mock data for demo
        setInspectionTypes([
          {
            inspectionTypeId: "1",
            name: "Giám định tài sản bất động sản",
            note: "Đánh giá giá trị nhà đất, căn hộ",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            inspectionTypeId: "2",
            name: "Giám định phương tiện giao thông",
            note: "Đánh giá xe ô tô, xe máy",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            inspectionTypeId: "3",
            name: "Giám định máy móc thiết bị",
            note: "Đánh giá máy móc công nghiệp",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
        ]);
      } finally {
        setLoadingInspectionTypes(false);
      }
    };

    fetchInspectionTypes();
  }, []);

  // Object type options
  const objectTypeOptions = [
    { value: "SERVICE_MANAGER", label: "Người quản lý dịch vụ" },
    { value: "IMPORTER", label: "Nhà nhập khẩu" },
  ];

  // Handle input change
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle input blur
  const handleInputBlur = (field: keyof ProfileFormData) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    validateField(field, formData[field]?.toString() || "");
  };

  // Validate single field
  const validateField = (field: keyof ProfileFormData, value: string) => {
    let error = "";

    switch (field) {
      case "serviceAddress":
        if (!value.trim()) {
          error = "Địa chỉ dịch vụ là bắt buộc";
        } else if (value.trim().length < 10) {
          error = "Địa chỉ dịch vụ phải có ít nhất 10 ký tự";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = "Email là bắt buộc";
        } else if (!emailRegex.test(value)) {
          error = "Email không hợp lệ";
        }
        break;
      case "taxCode":
        if (value.trim() && !/^\d{10,13}$/.test(value.trim())) {
          error = "Mã số thuế phải có 10-13 chữ số";
        }
        break;
      case "inspectionTypeId":
        if (!value) {
          error = "Vui lòng chọn loại hình giám định";
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  // Validate entire form
  const validateForm = () => {
    const fieldsToValidate: (keyof ProfileFormData)[] = [
      "serviceAddress",
      "email",
      "inspectionTypeId",
    ];

    let isValid = true;
    fieldsToValidate.forEach((field) => {
      const fieldValid = validateField(
        field,
        formData[field]?.toString() || ""
      );
      if (!fieldValid) isValid = false;
    });

    return isValid;
  };

  // Get customer type display
  const getCustomerTypeDisplay = (type: string) => {
    switch (type) {
      case "USER":
        return {
          text: "Cá nhân",
          color: "bg-blue-100 text-blue-800",
          icon: User,
        };
      case "BUSINESS":
        return {
          text: "Doanh nghiệp",
          color: "bg-purple-100 text-purple-800",
          icon: Building,
        };
      default:
        return {
          text: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          icon: Users,
        };
    }
  };

  const customerDisplay = getCustomerTypeDisplay(customer?.customerType ?? "");
  const CustomerIcon = customerDisplay.icon;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Tạo hồ sơ khách hàng
                  </h1>
                  <p className="text-sm text-gray-500">
                    Điền thông tin để tạo hồ sơ mới
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Section 1: Customer Info & Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Thông tin hồ sơ
                      </h2>
                      <p className="text-sm text-gray-600">
                        Thông tin khách hàng và loại hình giám định
                      </p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Bước 1/3
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Customer Info Display */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Thông tin khách hàng
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <CustomerIcon size={20} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          ID: {customer?.customerId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerDisplay.color}`}
                    >
                      {customerDisplay.text}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <span>{customer?.email}</span>
                    <span>•</span>
                    <span>{customer?.phone}</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Inspection Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại hình giám định{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {loadingInspectionTypes ? (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="animate-pulse flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded flex-1"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inspectionTypes.map((type) => (
                          <label
                            key={type.inspectionTypeId}
                            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.inspectionTypeId ===
                              type.inspectionTypeId
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="inspectionType"
                              value={type.inspectionTypeId}
                              checked={
                                formData.inspectionTypeId ===
                                type.inspectionTypeId
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "inspectionTypeId",
                                  e.target.value
                                )
                              }
                              className="mt-1 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {type.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {type.note}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {errors.inspectionTypeId && touched.inspectionTypeId && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">
                          {errors.inspectionTypeId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Service Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        rows={3}
                        value={formData.serviceAddress}
                        onChange={(e) =>
                          handleInputChange("serviceAddress", e.target.value)
                        }
                        onBlur={() => handleInputBlur("serviceAddress")}
                        placeholder="Nhập địa chỉ nơi thực hiện dịch vụ giám định..."
                        className={`pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm resize-none ${
                          errors.serviceAddress && touched.serviceAddress
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.serviceAddress && touched.serviceAddress && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">{errors.serviceAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email liên hệ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => handleInputBlur("email")}
                        placeholder="Nhập email liên hệ..."
                        className={`pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm ${
                          errors.email && touched.email
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Tax Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã số thuế (nếu có)
                    </label>
                    <div className="relative">
                      <Hash
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={formData.taxCode}
                        onChange={(e) =>
                          handleInputChange("taxCode", e.target.value)
                        }
                        onBlur={() => handleInputBlur("taxCode")}
                        placeholder="Nhập mã số thuế..."
                        className={`pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm ${
                          errors.taxCode && touched.taxCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.taxCode && touched.taxCode && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">{errors.taxCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Object Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại đối tượng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.objectType}
                      onChange={(e) =>
                        handleInputChange("objectType", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
                    >
                      {objectTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 & 3 Placeholders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-50">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-400">
                        Thông tin bổ sung
                      </h2>
                      <p className="text-sm text-gray-400">Sẽ hoàn thành sau</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    Bước 2/3
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 text-center py-8">
                  Section 2 - Đang phát triển
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-50">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-400">
                        Xác nhận và gửi
                      </h2>
                      <p className="text-sm text-gray-400">Sẽ hoàn thành sau</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    Bước 3/3
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 text-center py-8">
                  Section 3 - Đang phát triển
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const isValid = validateForm();
                  if (isValid) {
                    console.log("Form data to submit:", formData);
                    alert(
                      "Dữ liệu đã được lưu! Kiểm tra console để xem chi tiết."
                    );
                  } else {
                    // Mark all fields as touched to show errors
                    setTouched({
                      serviceAddress: true,
                      email: true,
                      taxCode: true,
                      inspectionTypeId: true,
                      objectType: true,
                    });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
              >
                <CheckCircle size={20} />
                <span>Lưu thông tin Section 1</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerProfileForm;
