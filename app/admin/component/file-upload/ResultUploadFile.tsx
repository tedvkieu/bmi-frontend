import React from "react";

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
  inspectionDate?: string | null;
  scheduledInspectionDate?: string | null;
  inspectionLocation?: string | null;
  createdAt?: string | null;
  customer?: Customer | null;
  customerSubmit?: Customer | null;
  customerRelated?: Customer | null;
  machines: Machine[];
}

interface UploadResultProps {
  data: UploadResultData;
  onStartNew: () => void;
}

export const UploadResultDisplay: React.FC<UploadResultProps> = ({
  data,
  onStartNew,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Chưa có";
    return parsed.toLocaleDateString("vi-VN");
  };

  const getCustomerTypeLabel = (type?: string | null) => {
    switch (type) {
      case "IMPORTER":
        return "Đơn vị nhập khẩu";
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
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3 text-sm text-gray-800">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Mã khách hàng
            </span>
            <span className="text-sm text-gray-900">
              ID: {customer.customerId ?? "—"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Tên đơn vị
            </span>
            <span className="text-sm text-gray-900">
              {customer.name || "—"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Địa chỉ
            </span>
            <span className="text-sm text-gray-900">
              {customer.address || "—"}
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Loại khách hàng
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getCustomerTypeLabel(customer.customerType)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Điện thoại
              </span>
              <span className="text-sm text-gray-900">
                {customer.phone || "—"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </span>
              <span className="text-sm text-gray-900">
                {customer.email || "—"}
              </span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Mã số thuế
            </span>
            <span className="text-sm text-gray-900">
              {customer.taxCode || "—"}
            </span>
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
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
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
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Mã Biên Nhận
              </label>
              <span className="text-xl font-bold text-green-600">
                #{data.receiptId}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Số Đăng Ký
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {data.registrationNo}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Ngày Đăng Ký
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {formatDate(data.createdAt ?? data.registrationDate ?? null)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Bill of Lading
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {data.billOfLading || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Ngày B/L
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {formatDate(data.billOfLadingDate)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Số Tờ Khai
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {data.declarationNo || "Chưa có"}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Dự kiến thời gian giám định
              </label>
              <span className="text-lg font-semibold text-gray-900">
                {formatDate(data.scheduledInspectionDate ?? null)}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Địa điểm giám định
              </label>
              <span className="text-lg font-semibold text-gray-900">
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
                Chi tiết khách hàng yêu cầu giám định và khách hàng nhập khẩu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCustomerCard("Khách hàng yêu cầu giám định", customerSubmit)}
            {renderCustomerCard("Khách hàng nhập khẩu", customerRelated)}
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
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Tên Thiết Bị
                    </label>
                    <p className="text-base font-semibold text-gray-900 leading-relaxed">
                      {machine.itemName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Thương Hiệu
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.brand || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Model
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.model || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Số Serial
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.serialNumber || "Chưa có"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nước Sản Xuất
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.manufactureCountry}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nhà Sản Xuất
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.manufacturerName}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Năm Sản Xuất
                    </label>
                    <span className="text-base font-medium text-gray-800">
                      {machine.manufactureYear}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Số Lượng
                    </label>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {machine.quantity}
                    </span>
                  </div>

                  {machine.note && (
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Ghi Chú
                      </label>
                      <p className="text-base text-gray-700 bg-gray-50 rounded-lg p-3">
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
            onClick={onStartNew}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
          >
            Tạo Hồ Sơ Mới
          </button>

          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl min-w-[200px]"
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
