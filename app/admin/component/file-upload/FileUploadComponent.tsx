import React, { useState, useRef } from "react";
interface Machine {
  machineId: number;
  receiptId: number;
  registrationNo: string | null;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear: number;
  quantity: number;
  usage: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}
interface Customer {
  customerId: number;
  name: string;
  address: string;
  email: string;
  dob: string | null;
  phone: string;
  note: string | null;
  taxCode: string | null;
  customerType: string;
  createdAt: string;
  updatedAt: string;
}
interface UploadResultData {
  receiptId: number;
  declarationNo: string;
  declarationDate: string | null;
  registrationNo: string;
  registrationDate: string;
  billOfLading: string;
  billOfLadingDate: string;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  inspectionDate?: string | null;
  inspectionLocation?: string | null;
  customer: Customer;
  machines: Machine[];
}
interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
const UploadResultDisplay: React.FC<{
  data: UploadResultData;
  onStartNew: () => void;
  onGoHome: () => void;
}> = ({ data, onStartNew, onGoHome }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case "IMPORTER":
        return "Nhà nhập khẩu";
      case "SERVICE_MANAGER":
        return "Quản lý dịch vụ";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full animate-pulse">
              <svg
                className="w-12 h-12 text-white"
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
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-3">
            Upload Thành Công!
          </h1>
          <p className="text-gray-700 text-base max-w-2xl mx-auto">
            Dữ liệu đã được xử lý và lưu trữ thành công vào hệ thống
          </p>
        </div>

        {/* Receipt Summary */}
        <div className="bg-gradient-to-r from-white via-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg
                className="w-8 h-8 text-green-600"
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
              <h2 className="text-2xl font-bold text-gray-900">
                Thông Tin Biên Nhận
              </h2>
              <p className="text-gray-600 font-medium">
                Chi tiết về biên nhận và khai báo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Mã Biên Nhận
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                #{data.receiptId}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Số Đăng Ký
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.registrationNo}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Ngày Đăng Ký
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {formatDate(data.registrationDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Bill of Lading
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.billOfLading || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Ngày B/L
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {formatDate(data.billOfLadingDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Số Tờ Khai
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.declarationNo || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Ngày Tờ Khai
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {formatDate(data.declarationDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Số Hóa Đơn
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.invoiceNo || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Ngày Hóa Đơn
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {formatDate(data.invoiceDate ?? null)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Dự Kiến Thời Gian Giám Định
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.inspectionDate ?? null}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Dự Kiến Địa Điểm Giám Định
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.inspectionLocation || "Chưa có"}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg
                className="w-8 h-8 text-blue-600"
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Thông Tin Khách Hàng
              </h2>
              <p className="text-gray-600 font-medium">
                ID: {data.customer.customerId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Tên Công Ty
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.customer.name}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Loại Khách Hàng
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getCustomerTypeLabel(data.customer.customerType)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Số Điện Thoại
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.customer.phone}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Địa Chỉ
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.customer.address}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Email
              </label>
              <span className="text-sm text-gray-900 break-words whitespace-normal">
                {data.customer.email}
              </span>
            </div>
          </div>
        </div>

        {/* Machines Information */}
        <div className="bg-gradient-to-r from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Danh Sách Máy Móc
                </h2>
                <p className="text-gray-600 font-medium">
                  Tổng cộng: {data.machines.length} máy móc
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {data.machines.map((machine, index) => (
              <div
                key={machine.machineId}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Máy móc #{index + 1}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    ID: {machine.machineId}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="col-span-full">
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Tên Thiết Bị
                    </label>
                    <p className="text-sm text-gray-900 leading-relaxed break-words whitespace-normal">
                      {machine.itemName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Thương Hiệu
                    </label>
                    <span className="text-sm text-gray-800 break-words whitespace-normal">
                      {machine.brand || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Model
                    </label>
                    <span className="text-sm text-gray-800 break-words whitespace-normal">
                      {machine.model || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Số Serial
                    </label>
                    <span className="text-sm text-gray-800 break-all whitespace-normal">
                      {machine.serialNumber || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Nước Sản Xuất
                    </label>
                    <span className="text-sm text-gray-800 break-words whitespace-normal">
                      {machine.manufactureCountry}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Nhà Sản Xuất
                    </label>
                    <span className="text-sm text-gray-800 break-words whitespace-normal">
                      {machine.manufacturerName}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Năm Sản Xuất
                    </label>
                    <span className="text-sm text-gray-800">
                      {machine.manufactureYear}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Số Lượng
                    </label>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {machine.quantity} đơn vị
                    </span>
                  </div>

                  {machine.note && (
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Ghi Chú
                      </label>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 break-words whitespace-normal">
                        {machine.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={onGoHome}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            Về Trang Chủ
          </button>

          <button
            onClick={onStartNew}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-base hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            Tạo Hồ Sơ Mới
          </button>

          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            In Kết Quả
          </button>
        </div>

        {/* Success Stats */}
        <div className="mt-12 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-2xl p-6 border border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              Thống Kê Upload
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-1">1</div>
                <div className="text-sm font-medium text-gray-600">
                  Khách hàng
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {data.machines.length}
                </div>
                <div className="text-sm font-medium text-gray-600">Máy móc</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {data.machines.reduce(
                    (sum, machine) => sum + machine.quantity,
                    0
                  )}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Tổng số lượng
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onCancel,
  loading,
  setLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResultData | null>(
    null
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    return (
      validTypes.includes(file.type) || validExtensions.includes(fileExtension)
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) {
      setError("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/dossiers/upload-excel", {
        method: "POST",
        body: formData,
      });

      console.log("Raw response:", res);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Có lỗi xảy ra khi upload file");
      }

      const data = await res.json();
      console.log("Parsed JSON:", data);

      // Check if the response has the complete structure
      if (data && data.receiptId && data.customer && data.machines) {
        // Show result display
        setUploadResult(data);
      } else {
        // Fallback to original success handler
        onUploadSuccess(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi upload file"
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGoHome = () => {
    // Navigate to home page
    window.location.href = "/admin";
  };

  const handleStartNew = () => {
    // Reset the upload result to show the upload form again
    setUploadResult(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show result display if upload was successful with complete data
  if (uploadResult) {
    return (
      <UploadResultDisplay
        data={uploadResult}
        onStartNew={handleStartNew}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Upload File Dữ Liệu
          </h1>
          <p className="text-gray-700 text-base max-w-2xl mx-auto">
            Tải lên file Excel hoặc CSV chứa thông tin khách hàng và máy móc
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full">
                  <svg
                    className="w-12 h-12 text-white"
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
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Kéo thả file vào đây hoặc nhấn để chọn
                  </p>
                  <p className="text-gray-500">
                    Hỗ trợ file: Excel (.xlsx, .xls) và CSV
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Kích thước tối đa: 10MB
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Chọn File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected File Display */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-500 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-white"
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
                      <h3 className="text-base font-semibold text-green-800">
                        {selectedFile.name}
                      </h3>
                      <p className="text-sm text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6"
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
                </div>
              </div>

              {/* Upload Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                  disabled={loading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    loading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Upload File"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
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
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            Hướng dẫn:
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              File phải có định dạng Excel (.xlsx, .xls) hoặc CSV
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Kích thước file không được vượt quá 10MB
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Đảm bảo file chứa đầy đủ thông tin khách hàng và máy móc
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
