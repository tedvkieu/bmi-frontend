// components/admin/CustomersPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomersPaginationProps {
    currentPage: number; // Đã đổi: Nhận 0-indexed page number
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void; // Gọi với 0-indexed page number
}

const CustomersPagination: React.FC<CustomersPaginationProps> = ({
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
}) => {
    // Tính toán lại startItem và endItem dựa trên currentPage (0-indexed)
    const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    if (totalPages <= 1) return null; // Don't show pagination if only one page

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = 0;
        let endPage = totalPages - 1;

        if (totalPages > maxPageButtons) {
            startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
            endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

            // Điều chỉnh nếu ở gần cuối
            if (endPage - startPage + 1 < maxPageButtons) {
                startPage = Math.max(0, totalPages - maxPageButtons);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            {/* Mobile Pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
            {/* Desktop Pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-black">
                        Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
                        <span className="font-medium">{endItem}</span> trong tổng số{" "}
                        <span className="font-medium">{totalElements}</span> khách hàng
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {getPageNumbers().map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)} // Gọi với 0-indexed page number
                                className={`relative inline-flex items-center px-2 py-1 border text-sm font-medium ${currentPage === pageNum
                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                        : "bg-white border-gray-300 text-black hover:bg-gray-50"
                                    }`}
                            >
                                {pageNum + 1} {/* Hiển thị cho người dùng là 1-indexed */}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                onPageChange(Math.min(totalPages - 1, currentPage + 1))
                            }
                            disabled={currentPage >= totalPages - 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default CustomersPagination;