// app/giam-dinh-vien/page.tsx
import React from "react";
import { Folder } from "lucide-react";
import AdminLayout from "../../component/AdminLayout";

const InspectorsPage = () => {
  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Folder size={48} className="mx-auto lg:w-16 lg:h-16" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Đang phát triển
        </h3>
        <p className="text-gray-500 text-sm lg:text-base">
          Trang quản lý giám định viên sẽ được bổ sung trong phiên bản tiếp
          theo.
        </p>
      </div>
    </AdminLayout>
  );
};

export default InspectorsPage;
