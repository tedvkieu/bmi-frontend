"use client";
import React, { useState } from "react";
import {
  Search,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from "lucide-react";
import { InspectionReport } from "../../types/inspection";

interface DocumentSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  statusFilter: InspectionReport["status"] | "all";
  setStatusFilter: (filter: InspectionReport["status"] | "all") => void;
  onCreateNew: () => void;
  sortBy: "newest" | "oldest";
  setSortBy: (sort: "newest" | "oldest") => void;
}

const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  searchTerm,
  onSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  React.useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(localSearchTerm.trim());
    }
  };

  const handleSearchClick = () => {
    onSearch(localSearchTerm.trim());
  };

  return (
    <div className="bg-white rounded-xl border-gray-100">
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative flex flex-1 items-center gap-2">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo số đăng ký, khách hàng..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Nút tìm kiếm */}
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm"
            >
              <Search size={16} className="text-white" />
              Tìm kiếm
            </button>
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
              className="border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:w-auto appearance-none bg-white pr-10 transition-all duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.2em",
              }}
            >
              <option value="all">Trạng thái hồ sơ</option>
              <option value="obtained">Đạt</option>
              <option value="not_obtained">Không đạt</option>
              <option value="pending">Đang xử lý</option>
              <option value="not_within_scope">Không thuộc phạm vi</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 sm:w-auto">
            {sortBy === "newest" ? (
              <ArrowDownWideNarrow
                size={20}
                className="text-gray-500 flex-shrink-0"
              />
            ) : (
              <ArrowUpWideNarrow
                size={20}
                className="text-gray-500 flex-shrink-0"
              />
            )}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest")
              }
              className="border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:w-auto appearance-none bg-white pr-10 transition-all duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.2em",
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearchBar;