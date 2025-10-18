// components/DocumentSearchBar.tsx

import React from "react";
import { Search, X, RefreshCw } from "lucide-react";
import { InspectionReport } from "../types/inspection";

interface DocumentSearchBarProps {
  searchTerm: string;
  localSearchTerm: string;
  setLocalSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  statusFilter: InspectionReport["status"] | "all";
  setStatusFilter: (filter: InspectionReport["status"] | "all") => void;
  sortBy: "newest" | "oldest";
  onSortChange: (sort: "newest" | "oldest") => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  onRefresh: () => void;
}

const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  localSearchTerm,
  setLocalSearchTerm,
  onSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  onSortChange,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  onRefresh,
}) => {
  const years = Array.from({ length: 10 }, (_, i) =>
    String(new Date().getFullYear() - i)
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onSearch("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input + Refresh */}
      <div className="flex items-center gap-2 w-full">
        {/* Input + icons */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="text"
            placeholder="Tìm kiếm theo số đăng ký"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onSearch(localSearchTerm);
              }
            }}
          />

          {localSearchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex items-center gap-1"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as InspectionReport["status"] | "all"
            )
          }
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="obtained">Hoàn thành</option>
          <option value="pending">Đang xử lý</option>
          <option value="not_obtained">Không hoàn thành</option>
          <option value="not_within_scope">Ngoài phạm vi</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "newest" | "oldest")}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>

        {/* Month Filter */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
        >
          <option value="">Tất cả tháng</option>
          {months.map((month) => (
            <option key={month} value={month}>
              Tháng {month}
            </option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
        >
          <option value="">Tất cả năm</option>
          {years.map((year) => (
            <option key={year} value={year}>
              Năm {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DocumentSearchBar;
