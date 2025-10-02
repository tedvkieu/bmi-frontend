// components/admin/CustomersContent.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Mail,
  Phone,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserX,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { MdGroups, MdOutlineGroupAdd } from "react-icons/md";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoMdCheckmark } from "react-icons/io";
import { customerApi, UnactiveCustomer } from "@/app/admin/services/customerApi";
import { authApi } from "@/app/services/authApi";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import ConfirmationModal from "@/app/admin/component/document/ConfirmationModal";

interface Customer {
  customerId: number;
  name: string;
  address: string; // Added address from your form example
  email: string;
  dob: string | null;
  phone: string;
  note: string;
  customerType: "IMPORTER" | "SERVICE_MANAGER";
  createdAt: string;
  updatedAt: string;
  username?: string; // Added for the modal's form fields
  isActive?: boolean; // Added for the modal's form fields
}

interface CustomerResponse {
  content: Customer[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

const CustomersContent = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false); // Renamed for clarity
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); // State to hold selected customer data

  const pageSize = 20;

  const [unapprovedCustomers, setUnapprovedCustomers] = useState<
    UnactiveCustomer[]
  >([]);
  const [unactiveCount, setUnactiveCount] = useState(0);
  const [isUnapprovedModalOpen, setIsUnapprovedModalOpen] =
    useState<boolean>(false);
  const [loadingUnapproved, setLoadingUnapproved] = useState<boolean>(false);
  const [unapprovedError, setUnapprovedError] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);


  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false); // State mới

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId) // bỏ chọn
        : [...prev, customerId] // thêm vào danh sách
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]); // bỏ chọn hết
    } else {
      setSelectedCustomers(customers.map((c) => c.customerId)); // chọn tất cả
    }
  };


  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const router = useRouter();

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    if (isMultiSelectMode) { // Nếu thoát chế độ, xóa các lựa chọn
      setSelectedCustomers([]);
    }
  };

  const fetchUnactiveCount = useCallback(async () => {
    try {
      setLoadingUnapproved(true);
      setUnapprovedError("");
      const token = authApi.getToken();
      if (!token) throw new Error("No authentication token");

      const res = await fetch(`/api/customers/unactive/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch unactive count");
      }

      const count = await res.json();
      setUnactiveCount(count);
    } catch (error: any) {
      console.error("Error fetching unactive count:", error);
      setUnapprovedError(error.message);
    } finally {
      setLoadingUnapproved(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data: CustomerResponse = await customerApi.getAllCustomers(
        currentPage,
        pageSize,
        searchTerm,
        customerTypeFilter
      );
      setCustomers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, customerTypeFilter, pageSize]);

  useEffect(() => {
    fetchCustomers();
    fetchUnactiveCount();
  }, [fetchCustomers, fetchUnactiveCount]);

  const loadUnapprovedCustomers = useCallback(async () => {
    setLoadingUnapproved(true);
    setUnapprovedError("");
    try {
      const list = await customerApi.getUnactiveCustomers();
      setUnapprovedCustomers(list);
    } catch (e: any) {
      setUnapprovedError(e?.message || "Không thể tải danh sách khách hàng chờ duyệt");
    } finally {
      setLoadingUnapproved(false);
    }
  }, []);

  const openUnapprovedCustomersModal = () => {
    loadUnapprovedCustomers();
    setIsUnapprovedModalOpen(true);
  };

  const closeUnapprovedCustomersModal = () => {
    setIsUnapprovedModalOpen(false);
    setUnapprovedCustomers([]);
    fetchCustomers();
    fetchUnactiveCount(); // Refresh count when closing modal
  };

  const handleApproveCustomer = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.approveCustomer(customerId);
      await loadUnapprovedCustomers();
      toast.success("Khách hàng đã được duyệt thành công!");
    } catch (e: any) {
      setUnapprovedError(e?.message || "Duyệt khách hàng thất bại");
    }
  };

  const handleDeleteCustomerById = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.deleteCustomerById(customerId);
      await loadUnapprovedCustomers();
      toast.success("Xóa thành công!");
    } catch (e: any) {
      setUnapprovedError(e?.message || "Xóa khách hàng thất bại");
    }
  };

  const handleRejectCustomer = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.rejectCustomer(customerId);
      await loadUnapprovedCustomers();
      toast.success("Khách hàng đã bị từ chối.");
    } catch (e: any) {
      setUnapprovedError(e?.message || "Từ chối khách hàng thất bại");
    }
  };

  // Renamed to openViewModal and updated to accept customer data
  const handleOpenViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  // Renamed to closeViewModal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCustomer(null); // Clear selected customer when closing
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleCustomerTypeFilter = (value: string) => {
    setCustomerTypeFilter(value);
    setCurrentPage(0);
  };

  const getCustomerTypeText = (type: string) => {
    switch (type) {
      case "IMPORTER":
        return "Nhà nhập khẩu";
      case "SERVICE_MANAGER":
        return "Quản lý dịch vụ";
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date strings
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const Pagination = () => {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
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
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage <= 2) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-2 py-1 border text-sm font-medium ${currentPage === pageNum
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-black hover:bg-gray-50"
                      }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleClickPage = (id: number) => {
    router.push(`/admin/hoso/tao-ho-so/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Thẻ Tổng khách hàng */}
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

        {/* Thẻ Khách hàng chờ duyệt */}
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

        {/* Thẻ Thêm mới khách hàng */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                  transition-all duration-300 ease-in-out hover:shadow-md hover:border-orange-300 hover:scale-[1.01] cursor-pointer"
          onClick={() => router.push("/admin/khachhang/them-moi-khach-hang")}>
          <div className="flex-shrink-0 bg-orange-100 text-orange-600 p-3 rounded-full">
            <Plus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Thêm mới</p>
            <button
              className="text-blue-600 font-semibold"
            >
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
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
            />
          </div>

          <div className="relative inline-block w-56">
            {/* Icon Filter bên trái */}
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            {/* Select box */}
            <select
              value={customerTypeFilter}
              onChange={(e) => handleCustomerTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tất cả khách hàng</option>
              <option value="IMPORTER">Khách hàng nhập khẩu</option>
              <option value="SERVICE_MANAGER">Khách hàng quản lý dịch vụ</option>
            </select>

            {/* Icon dropdown bên phải */}
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>


        {/* Customers Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <th className="px-6 py-3 text-left text-sm  text-black  min-w-[150px]">
                    STT
                  </th>
                  {/* <th className="px-6 py-3 text-left text-sm  text-black  min-w-[150px]">
                    Mã KH
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
                        // onClick={onRefresh}
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
                       {isMultiSelectMode && selectedCustomers.length > 0 && (
                          <button
                            onClick={() => setConfirmOpen(true)}
                            className="p-2 px-3 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            title="Xóa các khách hàng đã chọn"
                          >
                            Xóa  ({selectedCustomers.length})
                          </button>
                        )}
                    </div>

                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => (
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
                    <td className="px-6 py-4 text-sm">
                      {index + 1}
                    </td>
                    {/* <td className="px-6 py-4">
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
                          <span className="text-sm text-gray-900  max-w-[180px]">
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
                        <button
                          onClick={() => handleOpenViewModal(customer)} // Updated to pass customer object
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleClickPage(customer.customerId)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                          title="Lên hồ sơ"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/khachhang/${customer.customerId}`)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openConfirm(customer.customerId)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                    
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && <Pagination />}
        </div>
      </div>

      {/* Customers - Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {customers.map((customer) => (
          <div
            key={customer.customerId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Users size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 ">
                    {customer.name}
                  </p>
                  <p className="text-xs text-black">
                    ID: {customer.customerId}
                  </p>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 ">
                  {customer.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 ">
                  {customer.phone}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">
                  {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(
                  customer.customerType
                )}`}
              >
                <span>{getCustomerTypeText(customer.customerType)}</span>
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenViewModal(customer)} // Updated to pass customer object
                  className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleClickPage(customer.customerId)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                >
                  <FileText size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => openConfirm(customer.customerId)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {customers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Hiện tại chưa có khách hàng nào
          </h3>
          <p className="text-black text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn hoặc duyệt tài khoản khách hàng.
          </p>
        </div>
      )}

      {/* Unapproved Customers Modal */}
      {isUnapprovedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={closeUnapprovedCustomersModal}
          />
          <div className="relative bg-white w-full max-w-5xl mx-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-green-600 text-white rounded-t-lg flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                Danh sách khách hàng chờ duyệt
              </h4>
              <button
                onClick={closeUnapprovedCustomersModal}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingUnapproved ? (
                <div className="flex justify-center items-center h-48">
                  <LoadingSpinner />
                </div>
              ) : unapprovedError ? (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  {unapprovedError}
                </div>
              ) : unapprovedCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <IoMdCheckmark size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có khách hàng nào chờ duyệt
                  </h3>
                  <p className="text-black">
                    Tất cả khách hàng đã được duyệt hoặc chưa có yêu cầu mới.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black tracking-wider min-w-[150px]">
                          Tên công ty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black tracking-wider min-w-[180px]">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black tracking-wider min-w-[120px]">
                          Điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black tracking-wider min-w-[120px]">
                          Loại KH
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-black tracking-wider min-w-[100px]">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {unapprovedCustomers.map((customer) => (
                        <tr
                          key={customer.customerId}
                          className="hover:bg-blue-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="block  max-w-[150px]">
                              {customer.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            <span className="block  max-w-[180px]">
                              {customer.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            <span className="block  max-w-[120px]">
                              {customer.phone}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            {getCustomerTypeText(customer.customerType)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleApproveCustomer(customer.customerId)
                                }
                                className="p-2.5 rounded-full text-green-600 hover:bg-green-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                title="Duyệt"
                              >
                                <IoMdCheckmark size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectCustomer(customer.customerId)
                                }
                                className="p-2.5 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                title="Từ chối"
                              >
                                <UserX size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                type={"button"}
                onClick={closeUnapprovedCustomersModal}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-black hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer View Modal (Renamed from isModalOpen to isViewModalOpen) */}
      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" // Updated overlay for consistency
            onClick={handleCloseViewModal}
          />
          <div className="relative bg-white w-full max-w-4xl mx-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                Thông tin chi tiết khách hàng: {selectedCustomer.name}
              </h4>
              <button
                onClick={handleCloseViewModal}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.name}
                  </p>
                </div>
                {/* Customer ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khách hàng
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.customerId}
                  </p>
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.dob)}
                  </p>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.email}
                  </p>
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.phone}
                  </p>
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>
                {/* Customer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại khách hàng
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getCustomerTypeColor(
                      selectedCustomer.customerType
                    )}`}
                  >
                    {getCustomerTypeText(selectedCustomer.customerType)}
                  </span>
                </div>
                {('isActive' in selectedCustomer && typeof selectedCustomer.isActive === 'boolean') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái tài khoản
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${selectedCustomer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {selectedCustomer.isActive ? "Đã kích hoạt" : "Chưa kích hoạt"}
                    </span>
                  </div>
                )}
                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                {/* Updated At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cập nhật gần nhất
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.updatedAt)}
                  </p>
                </div>
              </div>
              {/* Note */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm min-h-[80px] whitespace-pre-wrap">
                  {selectedCustomer.note || "Không có ghi chú"}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Đóng
              </button>
              {/* You might want to add an "Edit" button here that navigates to the edit page */}
              <button
                type="button"
                onClick={() => router.push(`/admin/khachhang/${selectedCustomer.customerId}`)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (selectedId) {
            await handleDeleteCustomerById(selectedId);
            fetchCustomers();
          }
          setConfirmOpen(false);
        }}
        title="Xác nhận xóa khách hàng"
        message="Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác."
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (isMultiSelectMode && selectedCustomers.length > 0) {
            for (const id of selectedCustomers) {
              await handleDeleteCustomerById(id);
            }
            setSelectedCustomers([]); 
            toast.success(`Xóa thành công ${selectedCustomers.length} tài khoản khách hàng`)
            fetchCustomers();
          } else if (selectedId) {
            await handleDeleteCustomerById(selectedId);
            fetchCustomers();
          }
          setConfirmOpen(false);
        }}
        title="Xác nhận xóa khách hàng"
        message={
          isMultiSelectMode && selectedCustomers.length > 0
            ? `Bạn có chắc chắn muốn xóa ${selectedCustomers.length} khách hàng không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác."
        }
      />

    </div>
  );
};

export default CustomersContent;