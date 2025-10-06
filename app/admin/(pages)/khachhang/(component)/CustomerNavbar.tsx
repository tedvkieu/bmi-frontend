import React from 'react';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { MdGroups, MdOutlineGroupAdd } from 'react-icons/md';

interface CustomersNavbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    customerTypeFilter: "all" | "IMPORTER" | "SERVICE_MANAGER";
    onCustomerTypeFilterChange: (value: "all" | "IMPORTER" | "SERVICE_MANAGER") => void;
    totalElements: number;
    unactiveCount: number;
    loadingUnapproved: boolean;
    openUnapprovedCustomersModal: () => void;
    onAddNewCustomer: () => void;
    onRefresh: () => void;
    isMultiSelectMode: boolean;
    toggleMultiSelectMode: () => void;
    selectedCustomersCount: number;
    onDeleteSelected: () => void;
}

const CustomersNavbar: React.FC<CustomersNavbarProps> = ({
    searchTerm,
    onSearchChange,
    customerTypeFilter,
    onCustomerTypeFilterChange,
    totalElements,
    unactiveCount,
    loadingUnapproved,
    openUnapprovedCustomersModal,
    onAddNewCustomer
}) => {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Customers Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                          transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-300 hover:scale-[1.01] cursor-default">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full">
                        <MdGroups size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Số lượng khách hàng</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {totalElements}
                        </p>
                    </div>
                </div>

                {/* Unapproved Customers Card */}
                <div
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4 cursor-pointer
                                transition-all duration-300 ease-in-out hover:bg-gray-50 hover:shadow-md hover:border-green-300 hover:scale-[1.01]"
                    onClick={openUnapprovedCustomersModal}
                >
                    <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
                        <MdOutlineGroupAdd size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Tài khoản chờ duyệt
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {loadingUnapproved ? "..." : unactiveCount}
                        </p>
                    </div>
                </div>

                {/* Add New Customer Card */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                          transition-all duration-300 ease-in-out hover:shadow-md hover:border-orange-300 hover:scale-[1.01] cursor-pointer"
                    onClick={onAddNewCustomer}>
                    <div className="flex-shrink-0 bg-orange-100 text-orange-600 p-3 rounded-full">
                        <Plus size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Thêm mới</p>
                        <button className="text-blue-600 font-semibold">
                            Thêm khách hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-black space-y-4">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách hàng..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
                        />
                    </div>

                    <div className="relative inline-block w-56">
                        <Filter
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <select
                            value={customerTypeFilter}
                            onChange={(e) => onCustomerTypeFilterChange(e.target.value as "all" | "IMPORTER" | "SERVICE_MANAGER")}
                            className="pl-9 pr-8 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Tất cả khách hàng</option>
                            <option value="IMPORTER">Nhà nhập khẩu</option>
                            <option value="SERVICE_MANAGER">Nhà quản lý dịch vụ</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomersNavbar;