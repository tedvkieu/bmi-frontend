"use client"
import React from 'react';
import { Edit2, Trash2, Eye, FileText, RefreshCw } from 'lucide-react';
import { Customer } from '@/app/admin/services/customerApi';
import CustomTooltip from '@/app/admin/component/document/CustomTooltip';

interface CustomersTableProps {
    customers: Customer[];
    isMultiSelectMode: boolean;
    selectedCustomers: number[];
    handleSelectAllCustomers: () => void;
    handleSelectCustomer: (customerId: number) => void;
    onOpenViewModal: (customer: Customer) => void;
    onEditCustomer: (customerId: number) => void;
    onOpenConfirm: (customerId: number) => void;
    onRefresh: () => void;
    toggleMultiSelectMode: () => void;
    selectedCustomersCount: number;
    onDeleteSelected: () => void;
    loading: boolean; // Thêm prop loading
    onCreateDossier: (customerId: number) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
    customers,
    isMultiSelectMode,
    selectedCustomers,
    handleSelectAllCustomers,
    handleSelectCustomer,
    onOpenViewModal,
    onEditCustomer,
    onOpenConfirm,
    onRefresh,
    toggleMultiSelectMode,
    selectedCustomersCount,
    onDeleteSelected,
    loading, // Destructure loading
    onCreateDossier,
}) => {
    const getCustomerTypeText = (type: string) => {
        switch (type) {
            case "IMPORTER":
                return "Nhà nhập khẩu";
            case "SERVICE_MANAGER":
                return "Nhà quản lý dịch vụ";
            default:
                return "Không xác định";
        }
    };

    const getCustomerTypeColor = (type: string) => {
        switch (type) {
            case "IMPORTER":
                return "bg-blue-100 text-blue-800";
            case "SERVICE_MANAGER":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-black";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative"> {/* Add relative for spinner positioning */}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    {/* <LoadingSpinner /> */}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left">
                                {isMultiSelectMode && (
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        checked={selectedCustomers.length === customers.length && customers.length > 0}
                                        onChange={handleSelectAllCustomers}
                                        title="Chọn tất cả"
                                    />
                                )}
                            </th>
                            {/* <th className="px-6 py-3 text-left text-sm text-black min-w-[50px]">
                                ID
                            </th> */}
                            <th className="px-6 py-3 text-left text-sm font-bold text-black tracking-wider min-w-[150px]">
                                Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-black tracking-wider min-w-[200px]">
                                Liên hệ
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-black tracking-wider min-w-[120px]">
                                Nhóm khách hàng
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-bold text-black tracking-wider min-w-[120px]">
                                <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={onRefresh}
                                        className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 group"
                                        title="Làm mới dữ liệu"
                                    >
                                        <RefreshCw
                                            size={20}
                                            className="transition-transform duration-500 group-hover:rotate-180"
                                        />
                                    </button>
                                    <button
                                        onClick={toggleMultiSelectMode}
                                        className={`p-2 px-2 rounded-full text-white text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isMultiSelectMode
                                            ? "bg-gray-400 hover:bg-gray-500 focus:ring-gray-500"
                                            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                                            }`}
                                        title={isMultiSelectMode ? "Thoát chế độ chọn nhiều" : "Chọn nhiều để xóa"}
                                    >
                                        {isMultiSelectMode ? "Hủy chọn" : "Chọn nhiều"}
                                    </button>
                                    <span>Tùy chọn</span>
                                    {isMultiSelectMode && selectedCustomersCount > 0 && (
                                        <button
                                            onClick={onDeleteSelected}
                                            className="p-2 px-3 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            title="Xóa các khách hàng đã chọn"
                                        >
                                            Xóa  ({selectedCustomersCount})
                                        </button>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.length === 0 && !loading ? ( // Chỉ hiển thị "Không có dữ liệu" khi không loading và không có khách hàng
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    Không có dữ liệu khách hàng.
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.customerId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isMultiSelectMode && (
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                                checked={selectedCustomers.includes(customer.customerId)}
                                                onChange={() => handleSelectCustomer(customer.customerId)}
                                            />
                                        )}
                                    </td>
                                    {/* <td className="px-6 py-4 text-sm text-gray-800">
                                        {customer.customerId}
                                    </td> */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="max-w-[150px]">
                                                <p
                                                    className="text-sm font-medium text-gray-900 truncate"
                                                    title={customer.name}
                                                >
                                                    {customer.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-900 max-w-[180px]">
                                                    {customer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getCustomerTypeColor(
                                                customer.customerType
                                            )}`}
                                        >
                                            {getCustomerTypeText(customer.customerType)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-1">
                                            <CustomTooltip content="Xem chi tiết">
                                                <button
                                                    onClick={() => onOpenViewModal(customer)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                            </CustomTooltip>

                                            <CustomTooltip content="Lên hồ sơ">
                                                <button
                                                    onClick={() => onCreateDossier(customer.customerId)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                                                    title="Lên hồ sơ"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </CustomTooltip>
                                            <CustomTooltip content="Chỉnh sửa">

                                                <button
                                                    onClick={() => onEditCustomer(customer.customerId)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </CustomTooltip>

                                            <CustomTooltip content="Xóa hồ sơ">
                                                <button
                                                    onClick={() => onOpenConfirm(customer.customerId)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </CustomTooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersTable;
