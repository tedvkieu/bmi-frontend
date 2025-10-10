// components/document/PaginationControls.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  // Logic để hiển thị một số nút trang xung quanh trang hiện tại
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Số lượng nút trang tối đa để hiển thị

    let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

    // Điều chỉnh lại startPage nếu endPage chạm giới hạn
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }

    // Nút trang đầu tiên (nếu không nằm trong phạm vi hiển thị)
    if (startPage > 0) {
      pageNumbers.push(
        <button
          key={0}
          onClick={() => onPageChange(0)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 1) {
        pageNumbers.push(
          <span key="dots-start" className="px-3 py-1 text-sm text-gray-700">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 border rounded-md text-sm transition-colors duration-150 ${
            i === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Nút trang cuối cùng (nếu không nằm trong phạm vi hiển thị)
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pageNumbers.push(
          <span key="dots-end" className="px-3 py-1 text-sm text-gray-700">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className={`flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium transition-colors duration-150 ${
          currentPage === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronLeft size={16} className="mr-1" />
        Trước
      </button>

      <div className="flex items-center space-x-2">
        {renderPageNumbers()}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
        className={`flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium transition-colors duration-150 ${
          currentPage === totalPages - 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        Sau
        <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

export default PaginationControls;