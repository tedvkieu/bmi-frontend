// components/admin/documents/DocumentSearchBar.tsx
import React from "react";
import { Search, Filter } from "lucide-react";
import { InspectionReport } from "../../types/inspection"; // Adjust path as needed

interface DocumentSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: InspectionReport["status"] | "all";
  setStatusFilter: (filter: InspectionReport["status"] | "all") => void;
  onCreateNew: () => void;
}

const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="bg-white rounded-xl  border-gray-100">
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo số đăng ký, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-5 py-3 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-3 sm:w-auto">
            <Filter size={20} className="text-gray-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as InspectionReport["status"] | "all"
                )
              }
              className="border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:w-auto min-w-0 appearance-none bg-white pr-10 transition-all duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.2em",
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in_progress">Đang thực hiện</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearchBar;
