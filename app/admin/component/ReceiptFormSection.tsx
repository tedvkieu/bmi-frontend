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

    try {
      setInternalLoading(true);
      setError(null);

      // Cập nhật formData với customerRelatedId nếu có
      const updatedFormData = {
        ...formData,
        customerRelatedId: relatedCustomerId || formData.customerRelatedId,
      };

      // Gọi API submit receipt
      const response = await inspectionApi.submitReceipt(updatedFormData);

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
      formData.certificateDate.trim() !== "" &&
      formData.inspectionLocation.trim() !== ""
    );
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const isLoading = loading || internalLoading;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Thông Tin Biên Nhận</h2>
        <p>Điền các thông tin chi tiết cho biên nhận kiểm tra</p>
      </div>

      {/* Current Customer Info */}
      {customer && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
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

      {error && (
        <div className="error-message mb-6">
          <span className="error-icon">⚠</span>
          {error}
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Đóng thông báo lỗi"
          >
            ×
          </button>
        </div>
      )}

      {/* Customer Related Form */}
      <CustomerRelatedForm
        onCustomerCreated={handleCustomerCreated}
        loading={isLoading}
        setLoading={setInternalLoading}
      />

      {/* Display related customer info if created */}
      {relatedCustomerId && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
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
            <span className="text-green-800 font-medium">
              Đã tạo khách hàng liên quan thành công (ID: {relatedCustomerId})
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="receipt-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="registrationNo" className="form-label required">
              Số đăng ký
            </label>
            <input
              type="text"
              id="registrationNo"
              className="form-input"
              value={formData.registrationNo}
              onChange={(e) =>
                handleInputChange("registrationNo", e.target.value)
              }
              placeholder="Nhập số đăng ký"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="declarationNo" className="form-label required">
              Số tờ khai
            </label>
            <input
              type="text"
              id="declarationNo"
              className="form-input"
              value={formData.declarationNo}
              onChange={(e) =>
                handleInputChange("declarationNo", e.target.value)
              }
              placeholder="Nhập số tờ khai"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="billOfLading" className="form-label required">
              Vận đơn
            </label>
            <input
              type="text"
              id="billOfLading"
              className="form-input"
              value={formData.billOfLading}
              onChange={(e) =>
                handleInputChange("billOfLading", e.target.value)
              }
              placeholder="Nhập số vận đơn"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shipName" className="form-label required">
              Tên tàu
            </label>
            <input
              type="text"
              id="shipName"
              className="form-input"
              value={formData.shipName}
              onChange={(e) => handleInputChange("shipName", e.target.value)}
              placeholder="Nhập tên tàu"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cout10" className="form-label">
              Container 10 feet
            </label>
            <input
              type="number"
              id="cout10"
              className="form-input"
              value={formData.cout10 || ""}
              onChange={(e) => handleInputChange("cout10", e.target.value)}
              placeholder="Số lượng container 10 feet"
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cout20" className="form-label">
              Container 20 feet
            </label>
            <input
              type="number"
              id="cout20"
              className="form-input"
              value={formData.cout20 || ""}
              onChange={(e) => handleInputChange("cout20", e.target.value)}
              placeholder="Số lượng container 20 feet"
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bulkShip" className="form-label">
              Tàu chở hàng rời?
            </label>
            <input
              type="checkbox"
              id="bulkShip"
              className="form-checkbox"
              checked={formData.bulkShip || false}
              onChange={(e) => handleInputChange("bulkShip", e.target.checked)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="declarationDoc" className="form-label">
              Tài liệu tờ khai
            </label>
            <input
              type="text"
              id="declarationDoc"
              className="form-input"
              value={formData.declarationDoc}
              onChange={(e) =>
                handleInputChange("declarationDoc", e.target.value)
              }
              placeholder="Tên file tài liệu tờ khai"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="declarationPlace" className="form-label required">
              Nơi khai báo
            </label>
            <input
              type="text"
              id="declarationPlace"
              className="form-input"
              value={formData.declarationPlace}
              onChange={(e) =>
                handleInputChange("declarationPlace", e.target.value)
              }
              placeholder="Nhập nơi khai báo"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inspectionDate" className="form-label required">
              Ngày kiểm tra
            </label>
            <input
              type="date"
              id="inspectionDate"
              className="form-input"
              value={formatDateForInput(formData.inspectionDate)}
              onChange={(e) =>
                handleInputChange("inspectionDate", e.target.value)
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="certificateDate" className="form-label required">
              Ngày cấp chứng chỉ
            </label>
            <input
              type="date"
              id="certificateDate"
              className="form-input"
              value={formatDateForInput(formData.certificateDate)}
              onChange={(e) =>
                handleInputChange("certificateDate", e.target.value)
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inspectionLocation" className="form-label required">
              Địa điểm kiểm tra
            </label>
            <input
              type="text"
              id="inspectionLocation"
              className="form-input"
              value={formData.inspectionLocation}
              onChange={(e) =>
                handleInputChange("inspectionLocation", e.target.value)
              }
              placeholder="Nhập địa điểm kiểm tra"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="certificateStatus" className="form-label">
              Trạng thái chứng chỉ
            </label>
            <select
              id="certificateStatus"
              className="form-select"
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Đang xử lý...
              </>
            ) : (
              "Gửi biên nhận"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
