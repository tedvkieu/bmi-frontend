import React, { useEffect, useState } from "react";
import {
  FileText,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  MoreVertical,
} from "lucide-react";
import { InspectionReport } from "../../types/inspection"; // Adjust path as needed
import StatusBadge from "./StatusBadge"; // Import the new StatusBadge component
import { authApi } from "@/app/services/authApi";

interface DocumentMobileCardProps {
  document: InspectionReport;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentMobileCard: React.FC<DocumentMobileCardProps> = ({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(authApi.getRoleFromToken());
  }, []);

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  const isCompleted = document.status === "obtained";
  const canDelete = isAdminOrManager;
  const canEdit = isAdminOrManager || !isCompleted;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 transform hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-start justify-between mb-4 border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <FileText size={20} className="text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {document.name}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              #{document.id} • {document.type}
            </p>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700"
            aria-label="More actions"
          >
            <MoreVertical size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { onView(document.id); setIsMenuOpen(false); }}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye size={16} /> <span>Xem chi tiết</span>
              </button>
              <button
                onClick={() => { onDownload(document.id); setIsMenuOpen(false); }}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download size={16} /> <span>Tải xuống</span>
              </button>
              <button
                onClick={() => { if (canEdit) { onEdit(document.id); setIsMenuOpen(false); } }}
                disabled={!canEdit}
                className={`flex items-center space-x-2 w-full text-left px-4 py-2 text-sm  hover:bg-gray-100 ${canEdit ? "text-gray-700" : "text-gray-300 cursor-not-allowed"
                  }`}
              >
                <Edit2 size={16} /> <span>Chỉnh sửa</span>
              </button>
              <button
                onClick={() => { if (canDelete) { onDelete(document.id); setIsMenuOpen(false); } }}
                disabled={!canDelete}
                className={`flex items-center space-x-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${canDelete ? "text-red-600" : "text-red-300 cursor-not-allowed"
                  }`}
              >
                <Trash2 size={16} /> <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-5 text-gray-700">
        <div className="flex items-center space-x-3">
          <Building size={18} className="text-gray-500 flex-shrink-0" />
          <span className="text-base">
            Khách hàng: <span className="font-medium text-gray-800">{document.client}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <User size={18} className="text-gray-500 flex-shrink-0" />
          <span className="text-base">
            Giám định viên: <span className="font-medium text-gray-800">{document.inspector}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar size={18} className="text-gray-500 flex-shrink-0" />
          <span className="text-base">
            Ngày tạo: <span className="font-medium text-gray-800">{document.date}</span>
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <StatusBadge status={document.status} size="md" />
      </div>
    </div>
  );
};

export default DocumentMobileCard;