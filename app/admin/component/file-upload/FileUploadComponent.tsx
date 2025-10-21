import { Settings } from "lucide-react";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
interface Machine {
  machineId: number;
  dossierId: number;
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
  customer?: Customer | null;
  customerSubmit?: Customer | null;
  customerRelated?: Customer | null;
  machines: Machine[];
}
interface FileUploadProps {
  dossierId: number | null;
  onUploadSuccess: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  mode?: "create" | "update";
}
const UploadResultDisplay: React.FC<{
  data: UploadResultData;
  onStartNew: () => void;
  onGoHome: () => void;
}> = ({ data }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };


  const router = useRouter();
  const handleClick = () => {
    router.push(`/admin/phancong?registerNo=${encodeURIComponent(data.registrationNo)}`);
  };


  const getCustomerTypeLabel = (type?: string | null) => {
    switch (type) {
      case "IMPORTER":
        return "Nhà nhập khẩu";
      case "SERVICE_MANAGER":
        return "Quản lý dịch vụ";
      case "":
      case undefined:
      case null:
        return "Không xác định";
      default:
        return type;
    }
  };

  const customerSubmit = data.customerSubmit ?? data.customer ?? null;
  const customerRelated = data.customerRelated ?? null;

  const renderCustomerCard = (title: string, customer: Customer | null) => {
    if (!customer) return null;
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Mã khách hàng
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              ID: {customer.customerId ?? "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Tên đơn vị
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              {customer.name || "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Địa chỉ
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              {customer.address || "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Loại khách hàng
            </label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getCustomerTypeLabel(customer.customerType)}
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Số điện thoại
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              {customer.phone || "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              {customer.email || "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Mã số thuế
            </label>
            <p className="text-sm text-gray-900 whitespace-normal">
              {customer.taxCode || "—"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-full animate-pulse">
              <svg
                className="w-10 h-10 text-white"
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
          <h1 className="text-2xl lg:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-3">
            Upload hồ sơ thành công!
          </h1>
          <p className="text-gray-700 text-base max-w-2xl mx-auto">
            Thông tin hồ sơ đã được xử lý và lưu trữ trên hệ thống. Dưới đây là thông tin chi tiết.
          </p>
        </div>

        {/* Customer Information */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Khách hàng
              </h2>
              <p className="text-sm text-gray-600">
                Hiển thị thông tin khách hàng yêu cầu giám định và khách hàng nhập khẩu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCustomerCard("Khách hàng yêu cầu giám định", customerSubmit)}
            {renderCustomerCard("Khách hàng nhập khẩu", customerRelated)}
          </div>
        </div>


        {/* Receipt Summary */}
        <div className="bg-gradient-to-r from-white via-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-2 rounded-full mr-4">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông tin chung
              </h2>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Đăng ký số
              </label>
              <span className="text-sm text-red-500 font-bold whitespace-normal">
                {data.registrationNo}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Ngày Đăng Ký
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {formatDate(data.registrationDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Thuộc vận đơn số
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.billOfLading || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Ngày vận đơn
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {formatDate(data.billOfLadingDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Thuộc số tờ khai
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.declarationNo || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Ngày cấp số tờ khai
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {formatDate(data.declarationDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Thuộc hóa đơn số
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.invoiceNo || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Ngày cấp hóa đơn
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.invoiceDate ?? null}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Dự kiến thời gian giám định
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.inspectionDate ?? null}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Dự kiến địa điểm giám định
              </label>
              <span className="text-sm text-gray-900 whitespace-normal">
                {data.inspectionLocation || "Chưa có"}
              </span>
            </div>
          </div>
        </div>


        {/* Machines Information */}
        <div className="bg-gradient-to-r from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-200 p-6 lg:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full mr-4">
                <Settings color="gray" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Máy móc yêu cầu giám định
                </h2>
                <p className="text-gray-800 text-sm font-medium">
                  {data.machines.length} máy
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="border border-gray-400 bg-white text-[#1e3a8a] font-semibold text-center text-sm px-2 py-2">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-center w-[4%]">STT</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[18%]">Tên thiết bị</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[10%]">Thương hiệu</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[10%]">Model</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[10%]">Số serial</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[10%]">Nước sản xuất</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[12%]">Nhà sản xuất</th>
                  <th className="border border-gray-300 px-3 py-2 text-center w-[6%]">Năm SX</th>
                  <th className="border border-gray-300 px-3 py-2 text-center w-[6%]">Số lượng</th>
                  <th className="border border-gray-300 px-3 py-2 text-left w-[14%]">Ghi chú</th>
                </tr>
              </thead>

              <tbody>
                {data.machines.map((machine, index) => (
                  <tr key={machine.machineId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-3 py-2">{machine.itemName}</td>
                    <td className="border border-gray-300 px-3 py-2">{machine.brand || "Chưa có"}</td>
                    <td className="border border-gray-300 px-3 py-2">{machine.model || "Chưa có"}</td>
                    <td className="border border-gray-300 px-3 py-2 break-all">{machine.serialNumber || "Chưa có"}</td>
                    <td className="border border-gray-300 px-3 py-2">{machine.manufactureCountry}</td>
                    <td className="border border-gray-300 px-3 py-2">{machine.manufacturerName}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{machine.manufactureYear}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {machine.quantity}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 whitespace-pre-line">{machine.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 text-sm">
          <button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            In hồ sơ
          </button>
          <button
            onClick={handleClick}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            Phân công giám định
          </button>
        </div>

      </div>
    </div>
  );
};

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  dossierId,
  onUploadSuccess,
  onCancel,
  loading,
  setLoading,
  mode = "update",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResultData | null>(
    null
  );
  const isCreateMode = mode === "create";

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

    if (!isCreateMode && !dossierId) {
      setError("Không xác định được hồ sơ cần cập nhật.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (!isCreateMode && dossierId) {
      formData.append("dossierId", dossierId.toString());
    }

    try {
      const res = await fetch("/api/dossiers/upload-excel", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log("Raw response:", res);

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Có lỗi xảy ra khi upload file";
        if (errorText) {
          try {
            const parsed = JSON.parse(errorText);
            if (parsed?.error) {
              if (typeof parsed.error === "string") {
                errorMessage = parsed.error;
              } else if (typeof parsed.error.message === "string") {
                errorMessage = parsed.error.message;
              } else if (typeof parsed.message === "string") {
                errorMessage = parsed.message;
              }
            } else if (typeof parsed?.message === "string") {
              errorMessage = parsed.message;
            }
          } catch {
            errorMessage = errorText;
          }
        }
        if (errorMessage.includes("Số đăng ký đã tồn tại")) {
          const idx = errorMessage.indexOf("Số đăng ký đã tồn tại");
          errorMessage = errorMessage.slice(idx).trim();
        }
        throw new Error(errorMessage);
      }

      const rawData: any = await res.json();
      console.log("Parsed JSON:", rawData);

      const hasCustomerInfo =
        !!(
          rawData?.customerSubmit ||
          rawData?.customerRelated ||
          rawData?.customer
        );

      // Check if the response has the complete structure
      if (rawData && rawData.receiptId && rawData.machines && hasCustomerInfo) {
        const normalizedData: UploadResultData = {
          ...rawData,
          customer: rawData.customer ?? rawData.customerSubmit ?? null,
          customerSubmit: rawData.customerSubmit ?? rawData.customer ?? null,
          customerRelated: rawData.customerRelated ?? null,
        };

        // Show result display
        setUploadResult(normalizedData);
      } else {
        // Fallback to original success handler
        onUploadSuccess(rawData);
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
    <>        
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
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
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
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${loading
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
    </>

  );
};
