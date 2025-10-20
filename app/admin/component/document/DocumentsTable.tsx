import React, { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Download,
  UserPlus,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import { InspectionReport } from "../../types/inspection";
import { authApi } from "@/app/services/authApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomTooltip from "./CustomTooltip";
import StatusDropdown from "../dossier/StatusDropDown";
import { StatusUpdateResponse } from "../../services/dossierApi";

interface DocumentsTableProps {
  documents: InspectionReport[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
  onStatusChange: (
    id: string,
    newStatus: InspectionReport["status"]
  ) => Promise<StatusUpdateResponse>;
  onRefresh: (
    sortBy?: "newest" | "oldest",
    statusFilter?: InspectionReport["status"] | "all",
    searchTerm?: string
  ) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onDeleteMany,
  onStatusChange,
  onRefresh,
}) => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [sortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    setRole(authApi.getRoleFromToken());
  }, []);

  const handleSelectDocument = (id: string) => {
    setSelectedDocuments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((docId) => docId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAllDocuments = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDocuments.length > 0) {
      onDeleteMany(selectedDocuments);
      setSelectedDocuments([]);
      setIsMultiSelectMode(false);
    } else {
      toast.error("Vui lòng chọn ít nhất một tài liệu để xóa.");
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    if (isMultiSelectMode) {
      setSelectedDocuments([]);
    }
  };

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  return (
    <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-4 text-left">
                {isMultiSelectMode && (
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={
                      selectedDocuments.length === documents.length &&
                      documents.length > 0
                    }
                    onChange={handleSelectAllDocuments}
                    title="Chọn tất cả"
                  />
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-black"
              >
                Số đăng ký
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-black"
              >
                Khách hàng
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-black"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-sm font-semibold text-black"
              >
                <div className="flex items-center justify-end space-x-2">
                  <CustomTooltip content="Làm mới dữ liệu">
                    <button
                      onClick={() => onRefresh(sortBy)}
                      className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 group"
                    >
                      <RefreshCw
                        size={20}
                        className="transition-transform duration-500 group-hover:rotate-180"
                      />
                    </button>
                  </CustomTooltip>

                  {isAdminOrManager && (
                    <CustomTooltip
                      content={
                        isMultiSelectMode
                          ? "Thoát chế độ chọn nhiều"
                          : "Chọn nhiều để xóa"
                      }
                    >
                      <button
                        onClick={toggleMultiSelectMode}
                        className={`p-2 px-2 rounded-full text-white text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                          isMultiSelectMode
                            ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                        }`}
                      >
                        {isMultiSelectMode ? "Hủy chọn" : "Chọn nhiều"}
                      </button>
                    </CustomTooltip>
                  )}

                  {isAdminOrManager &&
                    isMultiSelectMode &&
                    selectedDocuments.length > 0 && (
                      <CustomTooltip content="Xóa các mục đã chọn">
                        <button
                          onClick={handleDeleteSelected}
                          className="p-2.5 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </CustomTooltip>
                    )}
                  <span>Tùy chọn</span>
                </div>
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
                const isCompleted = doc.status === "obtained";
                const canDelete = isAdminOrManager;
                const canEdit = isAdminOrManager || !isCompleted;
                const canChangeStatus = isAdminOrManager;

                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      selectedDocuments.includes(doc.id) && isMultiSelectMode
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isMultiSelectMode && (
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleSelectDocument(doc.id)}
                          title="Chọn tài liệu này"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-800 break-words">
                        {doc.customerRelatedName ||
                          doc.customerRelated?.name ||
                          doc.customerRelatedId ||
                          "Đang tải..."}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusDropdown
                        currentStatus={doc.status}
                        receiptId={doc.id}
                        onStatusChange={onStatusChange}
                        disabled={!canChangeStatus}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <CustomTooltip content="Xem chi tiết">
                          <button
                            onClick={() => onView(doc.id)}
                            className="p-2.5 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <Eye size={20} />
                          </button>
                        </CustomTooltip>

                        <CustomTooltip content="Tải xuống">
                          <button
                            onClick={() => onDownload(doc.id)}
                            className="p-2.5 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          >
                            <Download size={20} />
                          </button>
                        </CustomTooltip>

                        <CustomTooltip content="Phân công giám định viên">
                          <button
                            onClick={() => {
                              const reg = doc.registrationNo || doc.name;
                              router.push(
                                `/admin/phancong?registerNo=${encodeURIComponent(
                                  reg
                                )}`
                              );
                            }}
                            className="p-2.5 rounded-full text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                          >
                            <UserPlus size={20} />
                          </button>
                        </CustomTooltip>

                        <CustomTooltip content="Đánh giá">
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
                          >
                            <ClipboardCheck size={20} />
                          </button>
                        </CustomTooltip>

                        <CustomTooltip
                          content={
                            canEdit ? "Chỉnh sửa" : "Không có quyền chỉnh sửa"
                          }
                        >
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
                          >
                            <Edit2 size={20} />
                          </button>
                        </CustomTooltip>

                        <CustomTooltip
                          content={canDelete ? "Xóa" : "Không có quyền xóa"}
                        >
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
                          >
                            <Trash2 size={20} />
                          </button>
                        </CustomTooltip>
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
