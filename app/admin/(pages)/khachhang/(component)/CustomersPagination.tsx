// components/admin/CustomersPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomersPaginationProps {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const CustomersPagination: React.FC<CustomersPaginationProps> = ({
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
}) => {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    if (totalPages <= 1) return null; // Don't show pagination if only one page

    const getPageNumbers = () => {
        const pageNumbers = [];
        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (totalPages <= 5) {
            startPage = 0;
            endPage = totalPages - 1;
        } else {
            if (currentPage <= 2) {
                startPage = 0;
                endPage = 4;
            } else if (currentPage >= totalPages - 3) {
                startPage = totalPages - 5;
                endPage = totalPages - 1;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                onClick={() => onPageChange(pageNum)}
                                className={`relative inline-flex items-center px-2 py-1 border text-sm font-medium ${currentPage === pageNum
                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                        : "bg-white border-gray-300 text-black hover:bg-gray-50"
                                    }`}
                            >
                                {pageNum + 1}
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