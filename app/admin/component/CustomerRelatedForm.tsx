"use client";
import React, { useState } from "react";

interface CustomerRelatedData {
  name: string;
  address: string | null;
  email: string;
  dob: string | null;
  phone: string;
  customerType: string;
}

interface CustomerRelatedFormProps {
  onCustomerCreated: (customerId: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const customerTypeOptions = [
  { value: "SERVICE_MANAGER", label: "Quản lý dịch vụ" },
  { value: "IMPORTER", label: "Nhà nhập khẩu" },
  //{ value: "CUSTOMER", label: "Khách hàng" },
];

export const CustomerRelatedForm: React.FC<CustomerRelatedFormProps> = ({
  onCustomerCreated,
  loading,
  setLoading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CustomerRelatedData>({
    name: "",
    address: null,
    email: "",
    dob: null,
    phone: "",
    customerType: "SERVICE_MANAGER",
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof CustomerRelatedData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Tạo payload với các trường null được loại bỏ hoặc giữ nguyên theo yêu cầu
      const payload = {
        name: formData.name,
        address: formData.address,
        email: formData.email,
        dob: formData.dob,
        phone: formData.phone,
        customerType: formData.customerType,
      };

      // Gọi API tạo khách hàng
      const response = await fetch("http://localhost:3000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Có lỗi xảy ra khi tạo khách hàng"
        );
      }

      const result = await response.json();

      if (result.customerId) {
        onCustomerCreated(result.customerId);
        setShowForm(false);
        resetForm();
      } else {
        throw new Error("Không nhận được ID khách hàng từ server");
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo khách hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      (formData.name ?? "").trim() !== "" &&
      (formData.email ?? "").trim() !== "" &&
      (formData.phone ?? "").trim() !== "" &&
      (formData.customerType ?? "").trim() !== ""
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: null,
      email: "",
      dob: null,
      phone: "",
      customerType: "SERVICE_MANAGER",
    });
    setError(null);
  };

  if (!showForm) {
    return (
      <div className="form-group">
        <label className="form-label">Khách hàng liên quan</label>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">
            Chưa có khách hàng liên quan
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Thêm khách hàng liên quan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Thông tin khách hàng liên quan
        </h4>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 text-xl"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          disabled={loading}
        >
          ×
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label
              htmlFor="relatedCustomerName"
              className="form-label required"
            >
              Tên khách hàng
            </label>
            <input
              type="text"
              id="relatedCustomerName"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nhập tên khách hàng"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="relatedCustomerEmail"
              className="form-label required"
            >
              Email
            </label>
            <input
              type="email"
              id="relatedCustomerEmail"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Nhập email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="relatedCustomerPhone"
              className="form-label required"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="relatedCustomerPhone"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Nhập số điện thoại"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="relatedCustomerType"
              className="form-label required"
            >
              Loại khách hàng
            </label>
            <select
              id="relatedCustomerType"
              className="form-select"
              value={formData.customerType}
              onChange={(e) =>
                handleInputChange("customerType", e.target.value)
              }
              required
              disabled={loading}
            >
              {customerTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="relatedCustomerAddress" className="form-label">
              Địa chỉ <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </label>
            <input
              type="text"
              id="relatedCustomerAddress"
              className="form-input"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Nhập địa chỉ (không bắt buộc)"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="relatedCustomerDob" className="form-label">
              Ngày sinh{" "}
              <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </label>
            <input
              type="date"
              id="relatedCustomerDob"
              className="form-input"
              value={formData.dob || ""}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Đang tạo...
              </>
            ) : (
              "Tạo khách hàng"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
