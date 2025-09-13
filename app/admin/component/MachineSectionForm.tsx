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
  onComplete: () => void; // New prop for completing all forms
  loading: boolean;
}

export const MachineryFormSection: React.FC<MachineryFormSectionProps> = ({
  receiptId,
  registrationNo,
  onSubmit,
  onBack,
  onComplete,
  loading,
}) => {
  const [machineryForms, setMachineryForms] = useState<MachineryFormData[]>([
    {
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
    },
  ]);

  const [loadingStates, setLoadingStates] = useState<boolean[]>([false]);
  const [errors, setErrors] = useState<(string | null)[]>([null]);
  const [savedForms, setSavedForms] = useState<boolean[]>([false]);

  const handleInputChange = (
    formIndex: number,
    field: keyof MachineryFormData,
    value: string | number
  ) => {
    setMachineryForms((prev) => {
      const newForms = [...prev];
      newForms[formIndex] = {
        ...newForms[formIndex],
        [field]:
          field === "manufactureYear" || field === "quantity"
            ? Number(value)
            : value,
      };
      return newForms;
    });
  };

  const handleSubmitForm = async (formIndex: number) => {
    const formData = machineryForms[formIndex];

    try {
      setLoadingStates((prev) => {
        const newStates = [...prev];
        newStates[formIndex] = true;
        return newStates;
      });

      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[formIndex] = null;
        return newErrors;
      });

      const response = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Submit Machinery Response:", response);
      if (response.ok) {
        const data = await response.json();
        setSavedForms((prev) => {
          const newSaved = [...prev];
          newSaved[formIndex] = true;
          return newSaved;
        });
        onSubmit(data);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Có lỗi xảy ra khi gửi thông tin máy móc");
      }
    } catch (err) {
      console.error("Error submitting machinery:", err);
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[formIndex] =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi gửi thông tin máy móc";
        return newErrors;
      });
    } finally {
      setLoadingStates((prev) => {
        const newStates = [...prev];
        newStates[formIndex] = false;
        return newStates;
      });
    }
  };

  const addNewForm = () => {
    const newForm: MachineryFormData = {
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
    };

    setMachineryForms((prev) => [...prev, newForm]);
    setLoadingStates((prev) => [...prev, false]);
    setErrors((prev) => [...prev, null]);
    setSavedForms((prev) => [...prev, false]);
  };

  const removeForm = (formIndex: number) => {
    if (machineryForms.length > 1) {
      setMachineryForms((prev) =>
        prev.filter((_, index) => index !== formIndex)
      );
      setLoadingStates((prev) =>
        prev.filter((_, index) => index !== formIndex)
      );
      setErrors((prev) => prev.filter((_, index) => index !== formIndex));
      setSavedForms((prev) => prev.filter((_, index) => index !== formIndex));
    }
  };

  const isFormValid = (formData: MachineryFormData) => {
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

  const clearError = (formIndex: number) => {
    setErrors((prev) => {
      const newErrors = [...prev];
      newErrors[formIndex] = null;
      return newErrors;
    });
  };

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
          Thông tin yêu cầu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Số yêu cầu
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

      {/* Multiple Forms */}
      {machineryForms.map((formData, formIndex) => (
        <div
          key={formIndex}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Máy móc #{formIndex + 1}
              {savedForms[formIndex] && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Đã lưu
                </span>
              )}
            </h3>
            {machineryForms.length > 1 && (
              <button
                type="button"
                onClick={() => removeForm(formIndex)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Xóa form này"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {errors[formIndex] && (
            <div className="error-message mb-6">
              <span className="error-icon">⚠</span>
              {errors[formIndex]}
              <button
                className="error-close"
                onClick={() => clearError(formIndex)}
                aria-label="Đóng thông báo lỗi"
              >
                ×
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitForm(formIndex);
            }}
            className="receipt-form"
          >
            <div className="form-grid">
              <div className="form-group">
                <label
                  htmlFor={`itemName-${formIndex}`}
                  className="form-label required"
                >
                  Tên thiết bị
                </label>
                <input
                  type="text"
                  id={`itemName-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.itemName}
                  onChange={(e) =>
                    handleInputChange(formIndex, "itemName", e.target.value)
                  }
                  placeholder="Nhập tên thiết bị"
                  required
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor={`brand-${formIndex}`}
                  className="form-label required"
                >
                  Thương hiệu
                </label>
                <input
                  type="text"
                  id={`brand-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.brand}
                  onChange={(e) =>
                    handleInputChange(formIndex, "brand", e.target.value)
                  }
                  placeholder="Nhập thương hiệu"
                  required
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`model-${formIndex}`} className="form-label">
                  Model
                </label>
                <input
                  type="text"
                  id={`model-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.model}
                  onChange={(e) =>
                    handleInputChange(formIndex, "model", e.target.value)
                  }
                  placeholder="Nhập model"
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor={`serialNumber-${formIndex}`}
                  className="form-label"
                >
                  Số serial
                </label>
                <input
                  type="text"
                  id={`serialNumber-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    handleInputChange(formIndex, "serialNumber", e.target.value)
                  }
                  placeholder="Nhập số serial"
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor={`manufactureCountry-${formIndex}`}
                  className="form-label"
                >
                  Nước sản xuất
                </label>
                <input
                  type="text"
                  id={`manufactureCountry-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.manufactureCountry}
                  onChange={(e) =>
                    handleInputChange(
                      formIndex,
                      "manufactureCountry",
                      e.target.value
                    )
                  }
                  placeholder="Nhập nước sản xuất"
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor={`manufacturerName-${formIndex}`}
                  className="form-label"
                >
                  Tên nhà sản xuất
                </label>
                <input
                  type="text"
                  id={`manufacturerName-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.manufacturerName}
                  onChange={(e) =>
                    handleInputChange(
                      formIndex,
                      "manufacturerName",
                      e.target.value
                    )
                  }
                  placeholder="Nhập tên nhà sản xuất"
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor={`manufactureYear-${formIndex}`}
                  className="form-label"
                >
                  Năm sản xuất
                </label>
                <input
                  type="number"
                  id={`manufactureYear-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.manufactureYear}
                  onChange={(e) =>
                    handleInputChange(
                      formIndex,
                      "manufactureYear",
                      e.target.value
                    )
                  }
                  placeholder="Nhập năm sản xuất"
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`quantity-${formIndex}`} className="form-label">
                  Số lượng
                </label>
                <input
                  type="number"
                  id={`quantity-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange(formIndex, "quantity", e.target.value)
                  }
                  placeholder="Nhập số lượng"
                  min="1"
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor={`usage-${formIndex}`} className="form-label">
                  Công dụng
                </label>
                <textarea
                  id={`usage-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.usage}
                  onChange={(e) =>
                    handleInputChange(formIndex, "usage", e.target.value)
                  }
                  placeholder="Nhập mục đích sử dụng"
                  rows={3}
                  disabled={loadingStates[formIndex]}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor={`note-${formIndex}`} className="form-label">
                  Ghi chú
                </label>
                <textarea
                  id={`note-${formIndex}`}
                  className="form-input text-gray-600"
                  value={formData.note}
                  onChange={(e) =>
                    handleInputChange(formIndex, "note", e.target.value)
                  }
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  rows={3}
                  disabled={loadingStates[formIndex]}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingStates[formIndex] || !isFormValid(formData)}
              >
                {loadingStates[formIndex] ? (
                  <>
                    <span className="btn-spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu thông tin máy móc"
                )}
              </button>
            </div>
          </form>
        </div>
      ))}

      {/* Add New Form Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={addNewForm}
          className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          + Thêm hàng hóa giám định
        </button>
      </div>

      {/* Final Actions */}
      <div className="form-actions border-t pt-6">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
        >
          Quay lại
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onComplete}
          disabled={loading}
        >
          Hoàn thành
        </button>
      </div>
    </div>
  );
};
