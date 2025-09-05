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

  // Fetch inspection types from API
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Thông Tin Hồ Sơ Khách Hàng
        </h2>
        <p className="text-gray-600">
          Vui lòng điền đầy đủ thông tin để hoàn thành hồ sơ khách hàng
        </p>
      </div>

      {/* Current Customer Info */}
      {customer && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
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
            Thông tin khách hàng hiện tại
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tên khách hàng
              </label>
              <span className="text-gray-900 font-medium">{customer.name}</span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Số điện thoại
              </label>
              <span className="text-gray-900 font-medium">
                {customer.phone}
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Địa chỉ
              </label>
              <span className="text-gray-900 font-medium">
                {customer.address}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
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
            Thông tin chi tiết
          </h3>
          <p className="text-gray-500 mt-1">
            Điền các thông tin cần thiết cho hồ sơ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="serviceAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Địa chỉ dịch vụ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="serviceAddress"
              className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
              className="block text-sm font-medium text-gray-700"
            >
              Mã số thuế <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxCode"
              className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.taxCode}
              onChange={(e) => handleInputChange("taxCode", e.target.value)}
              placeholder="Nhập mã số thuế"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="objectType"
              className="block text-sm font-medium text-gray-700"
            >
              Đối tượng <span className="text-red-500">*</span>
            </label>
            <select
              id="objectType"
              className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.objectType}
              onChange={(e) => handleInputChange("objectType", e.target.value)}
              required
            >
              {objectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* Inspection Type Selection - Separate Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
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
            Loại hình giám định <span className="text-red-500">*</span>
          </h3>
          <p className="text-gray-500 mt-1">
            Chọn loại hình giám định phù hợp với nhu cầu của bạn
          </p>
        </div>

        {inspectionTypesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Đang tải danh sách...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
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
                <span className="text-red-700">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {inspectionTypes.map((inspectionType) => (
                <div
                  key={inspectionType.inspectionTypeId}
                  className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.inspectionTypeId ===
                    inspectionType.inspectionTypeId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    handleInputChange(
                      "inspectionTypeId",
                      inspectionType.inspectionTypeId
                    )
                  }
                >
                  <div className="p-4">
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
                          handleInputChange("inspectionTypeId", e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <label
                          htmlFor={`inspection-${inspectionType.inspectionTypeId}`}
                          className="block text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {inspectionType.name}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          {inspectionType.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedInspectionType && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
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
                    <h4 className="text-sm font-medium text-blue-900">
                      Đã chọn: {selectedInspectionType.name}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
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
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !isFormValid() || inspectionTypesLoading}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            loading || !isFormValid() || inspectionTypesLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </div>
          ) : (
            "Hoàn thành hồ sơ khách hàng"
          )}
        </button>
      </div>
    </div>
  );
};
