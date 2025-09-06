"use client";
import React, { useState } from "react";

interface MachineryFormData {
  receiptId: number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear: number;
  quantity: number;
  usage: string;
  note: string;
}

interface MachineryFormSectionProps {
  receiptId: number;
  registrationNo: string;
  onSubmit: (machineryData: MachineryFormData) => void;
  onBack: () => void;
  loading: boolean;
}

export const MachineryFormSection: React.FC<MachineryFormSectionProps> = ({
  receiptId,
  registrationNo,
  onSubmit,
  onBack,
  loading,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MachineryFormData>({
    receiptId,
    registrationNo,
    itemName: "",
    brand: "",
    model: "",
    serialNumber: "",
    manufactureCountry: "",
    manufacturerName: "",
    manufactureYear: new Date().getFullYear(),
    quantity: 1,
    usage: "",
    note: "",
  });

  const handleInputChange = (
    field: keyof MachineryFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "manufactureYear" || field === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setInternalLoading(true);
      setError(null);

      const response = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Submit Machinery Response:", response);
      if (response.ok) {
        const data = await response.json();
        onSubmit(data); // hoặc onSubmit(formData) nếu bạn chỉ cần gửi lại form
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Có lỗi xảy ra khi gửi thông tin máy móc");
      }

      const data = await response.json();

      onSubmit(formData);
    } catch (err) {
      console.error("Error submitting machinery:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi gửi thông tin máy móc"
      );
    } finally {
      setInternalLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.itemName.trim() !== "" &&
      formData.brand.trim() !== "" &&
      formData.model.trim() !== "" &&
      formData.serialNumber.trim() !== "" &&
      formData.manufactureCountry.trim() !== "" &&
      formData.manufacturerName.trim() !== "" &&
      formData.manufactureYear > 1900 &&
      formData.quantity > 0 &&
      formData.usage.trim() !== ""
    );
  };

  const isLoading = loading || internalLoading;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Thông Tin Máy Móc Giám Định</h2>
        <p>Điền các thông tin chi tiết về máy móc cần giám định</p>
      </div>

      {/* Receipt Info */}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Thông tin biên nhận
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Mã biên nhận
            </label>
            <span className="text-gray-900 font-medium">{receiptId}</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Số đăng ký
            </label>
            <span className="text-gray-900 font-medium">{registrationNo}</span>
          </div>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="receipt-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="itemName" className="form-label required">
              Tên thiết bị
            </label>
            <input
              type="text"
              id="itemName"
              className="form-input"
              value={formData.itemName}
              onChange={(e) => handleInputChange("itemName", e.target.value)}
              placeholder="Nhập tên thiết bị"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand" className="form-label required">
              Thương hiệu
            </label>
            <input
              type="text"
              id="brand"
              className="form-input"
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="Nhập thương hiệu"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="model" className="form-label required">
              Model
            </label>
            <input
              type="text"
              id="model"
              className="form-input"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              placeholder="Nhập model"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="serialNumber" className="form-label required">
              Số serial
            </label>
            <input
              type="text"
              id="serialNumber"
              className="form-input"
              value={formData.serialNumber}
              onChange={(e) =>
                handleInputChange("serialNumber", e.target.value)
              }
              placeholder="Nhập số serial"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufactureCountry" className="form-label required">
              Nước sản xuất
            </label>
            <input
              type="text"
              id="manufactureCountry"
              className="form-input"
              value={formData.manufactureCountry}
              onChange={(e) =>
                handleInputChange("manufactureCountry", e.target.value)
              }
              placeholder="Nhập nước sản xuất"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturerName" className="form-label required">
              Tên nhà sản xuất
            </label>
            <input
              type="text"
              id="manufacturerName"
              className="form-input"
              value={formData.manufacturerName}
              onChange={(e) =>
                handleInputChange("manufacturerName", e.target.value)
              }
              placeholder="Nhập tên nhà sản xuất"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufactureYear" className="form-label required">
              Năm sản xuất
            </label>
            <input
              type="number"
              id="manufactureYear"
              className="form-input"
              value={formData.manufactureYear}
              onChange={(e) =>
                handleInputChange("manufactureYear", e.target.value)
              }
              placeholder="Nhập năm sản xuất"
              min="1900"
              max={new Date().getFullYear()}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label required">
              Số lượng
            </label>
            <input
              type="number"
              id="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              placeholder="Nhập số lượng"
              min="1"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="usage" className="form-label required">
              Mục đích sử dụng
            </label>
            <textarea
              id="usage"
              className="form-input"
              value={formData.usage}
              onChange={(e) => handleInputChange("usage", e.target.value)}
              placeholder="Nhập mục đích sử dụng"
              rows={3}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="note" className="form-label">
              Ghi chú
            </label>
            <textarea
              id="note"
              className="form-input"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="Nhập ghi chú (không bắt buộc)"
              rows={3}
              disabled={isLoading}
            />
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
              "Gửi thông tin máy móc"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
