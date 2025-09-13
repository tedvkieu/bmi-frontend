import React, { useState } from "react";
import { ReceiptFormData } from "../types/inspection";
import { Customer } from "../types/customer";
import { inspectionApi } from "../services/inspectionApi";
import { CustomerRelatedForm } from "./CustomerRelatedForm";

interface ReceiptFormSectionProps {
  customer: Customer;
  formData: ReceiptFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReceiptFormData>>;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const certificateStatusOptions = [
  { value: "PENDING", label: "Đang chờ xử lý" },
  { value: "APPROVED", label: "Đã phê duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "EXPIRED", label: "Đã hết hạn" },
];

export const ReceiptFormSection: React.FC<ReceiptFormSectionProps> = ({
  customer,
  formData,
  setFormData,
  onSubmit,
  onBack,
  loading,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedCustomerId, setRelatedCustomerId] = useState<number | null>(
    formData.customerRelatedId || null
  );

  const handleInputChange = (
    field: keyof ReceiptFormData,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field.includes("cout") ||
        field.includes("bulkShip") ||
        field.includes("Id")
          ? Number(value)
          : value,
    }));
  };

  const handleCustomerCreated = (customerId: number) => {
    setRelatedCustomerId(customerId);
    setFormData((prev) => ({
      ...prev,
      customerRelatedId: customerId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting receipt with data:", formData);

    try {
      setInternalLoading(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        customerRelatedId:
          (relatedCustomerId || formData.customerRelatedId) &&
          (relatedCustomerId || formData.customerRelatedId) !== 0
            ? relatedCustomerId || formData.customerRelatedId
            : formData.customerSubmitId,
      };

      console.log("Data to submit:", dataToSubmit);
      console.log("customerSubmitId:", dataToSubmit.customerSubmitId);
      console.log("customerRelatedId:", dataToSubmit.customerRelatedId);

      const response = await inspectionApi.submitReceipt(dataToSubmit);

      if (response.success) {
        onSubmit();
      } else {
        throw new Error(response.message || "Có lỗi xảy ra khi gửi biên nhận");
      }
    } catch (err) {
      console.error("Error submitting receipt:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi biên nhận"
      );
    } finally {
      setInternalLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.registrationNo.trim() !== "" &&
      formData.declarationNo.trim() !== "" &&
      formData.billOfLading.trim() !== "" &&
      formData.shipName.trim() !== "" &&
      formData.declarationPlace.trim() !== "" &&
      formData.inspectionDate.trim() !== "" &&
      // formData.certificateDate.trim() !== "" &&
      formData.inspectionLocation.trim() !== ""
    );
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const isLoading = loading || internalLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-full">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Thông Tin Biên Nhận
          </h1>
          <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Điền các thông tin chi tiết cho biên nhận kiểm tra
          </p>
        </div>

        {/* Current Customer Info */}
        {customer && (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 lg:p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-gradient-to-r from-white to-emerald-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tên khách hàng
                </label>
                <span className="text-gray-900 text-lg">{customer.name}</span>
              </div>
              <div className="bg-gradient-to-r from-white to-teal-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Số điện thoại
                </label>
                <span className="text-gray-900 text-lg">{customer.phone}</span>
              </div>
              <div className="bg-gradient-to-r from-white to-cyan-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Địa chỉ
                </label>
                <span className="text-gray-900 text-lg">
                  {customer.address}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8 shadow-sm">
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
                onClick={() => setError(null)}
                aria-label="Đóng thông báo lỗi"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Customer Related Form */}
        <div className="mb-8">
          <CustomerRelatedForm
            onCustomerCreated={handleCustomerCreated}
            loading={isLoading}
            setLoading={setInternalLoading}
          />
        </div>

        {/* Success Message for Related Customer */}
        {relatedCustomerId && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-3"
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
              <span className="text-green-800 font-bold text-lg">
                Đã tạo khách hàng liên quan thành công (ID: {relatedCustomerId})
              </span>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center mb-8">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-teal-600"
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
                Chi tiết biên nhận
              </h3>
              <p className="text-gray-700 font-medium mt-1">
                Nhập thông tin đầy đủ cho biên nhận kiểm tra
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Number */}
              <div className="space-y-3">
                <label
                  htmlFor="registrationNo"
                  className="block text-sm font-bold text-gray-800"
                >
                  Số đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registrationNo"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.registrationNo}
                  onChange={(e) =>
                    handleInputChange("registrationNo", e.target.value)
                  }
                  placeholder="Nhập số đăng ký"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Declaration Number */}
              <div className="space-y-3">
                <label
                  htmlFor="declarationNo"
                  className="block text-sm font-bold text-gray-800"
                >
                  Số tờ khai <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="declarationNo"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.declarationNo}
                  onChange={(e) =>
                    handleInputChange("declarationNo", e.target.value)
                  }
                  placeholder="Nhập số tờ khai"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Bill of Lading */}
              <div className="space-y-3">
                <label
                  htmlFor="billOfLading"
                  className="block text-sm font-bold text-gray-800"
                >
                  Vận đơn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="billOfLading"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.billOfLading}
                  onChange={(e) =>
                    handleInputChange("billOfLading", e.target.value)
                  }
                  placeholder="Nhập số vận đơn"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Ship Name */}
              <div className="space-y-3">
                <label
                  htmlFor="shipName"
                  className="block text-sm font-bold text-gray-800"
                >
                  Tên tàu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shipName"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.shipName}
                  onChange={(e) =>
                    handleInputChange("shipName", e.target.value)
                  }
                  placeholder="Nhập tên tàu"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Container 10 */}
              <div className="space-y-3">
                <label
                  htmlFor="cout10"
                  className="block text-sm font-bold text-gray-800"
                >
                  Container 20 feet
                </label>
                <input
                  type="number"
                  id="cout10"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.cout10 || ""}
                  onChange={(e) => handleInputChange("cout10", e.target.value)}
                  placeholder="Số lượng container 10 feet"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              {/* Container 20 */}
              <div className="space-y-3">
                <label
                  htmlFor="cout20"
                  className="block text-sm font-bold text-gray-800"
                >
                  Container 40 feet
                </label>
                <input
                  type="number"
                  id="cout20"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.cout20 || ""}
                  onChange={(e) => handleInputChange("cout20", e.target.value)}
                  placeholder="Số lượng container 20 feet"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              {/* Declaration Place */}
              <div className="space-y-3">
                <label
                  htmlFor="declarationPlace"
                  className="block text-sm font-bold text-gray-800"
                >
                  Nơi khai báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="declarationPlace"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.declarationPlace}
                  onChange={(e) =>
                    handleInputChange("declarationPlace", e.target.value)
                  }
                  placeholder="Nhập nơi khai báo"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Declaration Doc */}
              <div className="space-y-3">
                <label
                  htmlFor="declarationDoc"
                  className="block text-sm font-bold text-gray-800"
                >
                  Tài liệu tờ khai
                </label>
                <input
                  type="text"
                  id="declarationDoc"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.declarationDoc}
                  onChange={(e) =>
                    handleInputChange("declarationDoc", e.target.value)
                  }
                  placeholder="Tên file tài liệu tờ khai"
                  disabled={isLoading}
                />
              </div>

              {/* Inspection Date */}
              <div className="space-y-3">
                <label
                  htmlFor="inspectionDate"
                  className="block text-sm font-bold text-gray-800"
                >
                  Ngày kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="inspectionDate"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium"
                  value={formatDateForInput(formData.inspectionDate)}
                  onChange={(e) =>
                    handleInputChange("inspectionDate", e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Certificate Date */}
              {/* <div className="space-y-3">
                <label
                  htmlFor="certificateDate"
                  className="block text-sm font-bold text-gray-800"
                >
                  Ngày cấp chứng chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="certificateDate"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium"
                  value={formatDateForInput(formData.certificateDate)}
                  onChange={(e) =>
                    handleInputChange("certificateDate", e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div> */}

              {/* Inspection Location */}
              <div className="space-y-3">
                <label
                  htmlFor="inspectionLocation"
                  className="block text-sm font-bold text-gray-800"
                >
                  Địa điểm kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="inspectionLocation"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium placeholder-gray-500"
                  value={formData.inspectionLocation}
                  onChange={(e) =>
                    handleInputChange("inspectionLocation", e.target.value)
                  }
                  placeholder="Nhập địa điểm kiểm tra"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Certificate Status */}
              <div className="space-y-3">
                <label
                  htmlFor="certificateStatus"
                  className="block text-sm font-bold text-gray-800"
                >
                  Trạng thái chứng chỉ
                </label>
                <select
                  id="certificateStatus"
                  className="w-full text-gray-800 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md font-medium"
                  value={formData.certificateStatus}
                  onChange={(e) =>
                    handleInputChange("certificateStatus", e.target.value)
                  }
                  disabled={isLoading}
                >
                  {certificateStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Ship Checkbox */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bulkShip"
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  checked={formData.bulkShip || false}
                  onChange={(e) =>
                    handleInputChange("bulkShip", e.target.checked)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="bulkShip"
                  className="text-base font-bold text-gray-800 cursor-pointer"
                >
                  Tàu chở hàng rời
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8">
              <button
                type="button"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={onBack}
                disabled={isLoading}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isLoading || !isFormValid()
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 hover:scale-105 shadow-xl hover:shadow-2xl"
                } min-w-[200px]`}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Gửi biên nhận"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
