import React, { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
import { InspectionReport } from "../../types/inspection";
import StatusBadge from "./StatusBadge";
import { authApi } from "@/app/services/authApi";
import axios from "axios";
import { useRouter } from "next/navigation";

interface DocumentsTableProps {
  documents: InspectionReport[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [customerSubmit, setCustomerSubmit] = useState<Record<string, string>>({});

  useEffect(() => {
    setRole(authApi.getRoleFromToken());
  }, []);

  // Load khách hàng từ API theo doc.client
  useEffect(() => {
    const fetchCustomersSubmit = async () => {
      const newCustomers: Record<string, string> = {};

      for (const doc of documents) {
        if (doc.customerSubmitId && !customerSubmit[doc.customerSubmitId]) {
          try {
            const res = await axios.get(`/api/customers/${doc.id}`);
            newCustomers[doc.customerSubmitId] = res.data.name;
          } catch (err) {
            console.error("Lỗi tải khách hàng:", err);
            newCustomers[doc.customerSubmitId] = "Không rõ khách hàng";
          }
        }
      }

      if (Object.keys(newCustomers).length > 0) {
        setCustomerSubmit((prev) => ({ ...prev, ...newCustomers }));
      }
    };

    // const fetchCustomersRelated = async () => {
    //   const newCustomers: Record<string, string> = {};

    //   for (const doc of documents) {
    //     if (doc.customerRelatedId && !customerRelated[doc.customerRelatedId]) {
    //       try {
    //         const res = await axios.get(`/api/customers/${doc.id}`);
    //         newCustomers[doc.customerSubmitId] = res.data.name;
    //       } catch (err) {
    //         console.error("Lỗi tải khách hàng:", err);
    //         newCustomers[doc.customerSubmitId] = "Không rõ khách hàng";
    //       }
    //     }
    //   }

    //   if (Object.keys(newCustomers).length > 0) {
    //     setCustomerRelated((prev) => ({ ...prev, ...newCustomers }));
    //   }
    // };

    if (documents.length > 0) {
      fetchCustomersSubmit();
      // fetchCustomersRelated();
    }
  }, [documents]);

  return (
    <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
              >
                Số đăng ký
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
              >
                Khách hàng
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
              >
                Ngày tạo
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-semibold text-blue-800 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-lg text-gray-500 italic"
                >
                  Không tìm thấy tài liệu nào.
                  <p className="mt-2 text-sm text-gray-400">
                    Hãy thử tạo một tài liệu mới hoặc điều chỉnh bộ lọc.
                  </p>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isAdminOrManager =
                  role === "ADMIN" || role === "MANAGER";
                const isCompleted = doc.status === "obtained";
                const canDelete = isAdminOrManager;
                const canEdit = isAdminOrManager || !isCompleted;

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-800">
                        {customerSubmit[doc.customerSubmitId] || "Đang tải..."}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={doc.status} size="md" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-800">
                          {doc.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView(doc.id)}
                          className="p-2.5 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => onDownload(doc.id)}
                          className="p-2.5 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          title="Tải xuống"
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={() => {
                            const reg = doc.registrationNo || doc.name;
                            router.push(
                              `/admin/phan-cong?registerNo=${encodeURIComponent(
                                reg
                              )}`
                            );
                          }}
                          className="p-2.5 rounded-full text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                          title="Gán người dùng"
                        >
                          <UserPlus size={20} />
                        </button>
                        <button
                          onClick={() => {
                            const reg = doc.registrationNo || doc.name;
                            router.push(
                              `/admin/evaluation?registerNo=${encodeURIComponent(
                                reg
                              )}`
                            );
                          }}
                          className="p-2.5 rounded-full text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                          title="Đánh giá"
                        >
                          <ClipboardCheck size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if (canEdit) onEdit(doc.id);
                          }}
                          disabled={!canEdit}
                          className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            canEdit
                              ? "text-gray-600 hover:bg-purple-100 hover:text-purple-700 focus:ring-purple-500"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title={
                            canEdit
                              ? "Chỉnh sửa"
                              : "Không có quyền chỉnh sửa"
                          }
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if (canDelete) onDelete(doc.id);
                          }}
                          disabled={!canDelete}
                          className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            canDelete
                              ? "text-gray-600 hover:bg-red-100 hover:text-red-700 focus:ring-red-500"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title={canDelete ? "Xóa" : "Không có quyền xóa"}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsTable;
