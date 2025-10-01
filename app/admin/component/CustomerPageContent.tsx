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
  UserCheck, // New icon for unapproved customers
  UserX, // New icon for rejecting customers
} from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./document/LoadingSpinner";
import { authApi } from "../../services/authApi";
import { customerApi, UnactiveCustomer } from "../services/customerApi";
import toast from "react-hot-toast";

interface Customer {
  customerId: number;
  name: string;
  address: string;
  email: string;
  dob: string | null;
  phone: string;
  note: string;
  customerType: "IMPORTER" | "SERVICE_MANAGER";
  createdAt: string;
  updatedAt: string;
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
  const pageSize = 10;

  const [unapprovedCustomers, setUnapprovedCustomers] = useState<
    UnactiveCustomer[]
  >([]);
  const [unactiveCount, setUnactiveCount] = useState(0);
  const [isUnapprovedModalOpen, setIsUnapprovedModalOpen] =
    useState<boolean>(false);
  const [loadingUnapproved, setLoadingUnapproved] = useState<boolean>(false);
  const [unapprovedError, setUnapprovedError] = useState<string>("");

  const router = useRouter();

  const roleFromToken = authApi.getRoleFromToken() as string | null;
  const isAdminOrManager = roleFromToken === "ADMIN" || roleFromToken === "MANAGER";

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
  }, [fetchCustomers, fetchUnactiveCount]); // Added fetchUnactiveCount to dependencies

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
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
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
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
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
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`relative inline-flex items-center px-2 py-1 border text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
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
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    router.push(`/admin/tao-ho-so/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-gray-800">
        <div className="flex flex-col space-y-4">
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
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 sm:w-auto">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={customerTypeFilter}
                onChange={(e) => handleCustomerTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex-1 sm:w-auto min-w-0"
              >
                <option value="all">Tất cả loại KH</option>
                <option value="IMPORTER">Nhà nhập khẩu</option>
                <option value="SERVICE_MANAGER">Quản lý dịch vụ</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isAdminOrManager && (
              <button
                onClick={openUnapprovedCustomersModal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium flex-1"
              >
                {/* <UserCheck size={16} /> */}
                <span>
                  Tài khoản chờ duyệt {loadingUnapproved ? "..." : `(${unactiveCount})`}
                </span>
              </button>
            )}

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium flex-1">
              <Plus size={16} />
              <span>Thêm khách hàng mới</span>
            </button>
          </div>
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-500">
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
                <span className="text-sm text-gray-900 truncate">
                  {customer.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">
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
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
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
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Loại KH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Ghi chú
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Users size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="truncate max-w-[150px]">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {customer.customerId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate max-w-[180px]">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate max-w-[180px]">
                          {customer.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeColor(
                        customer.customerType
                      )}`}
                    >
                      {getCustomerTypeText(customer.customerType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 max-w-[200px] truncate block">
                      {customer.note || "Không có ghi chú"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900">
                        {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
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
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
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

      {/* No results */}
      {customers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy khách hàng
          </h3>
          <p className="text-gray-500">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
          </p>
        </div>
      )}

      {/* Unapproved Customers Modal */}
      {isUnapprovedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" // Changed overlay color for better contrast
            onClick={closeUnapprovedCustomersModal}
          />
          <div className="relative bg-white w-full max-w-4xl mx-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
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
                  <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có khách hàng nào chờ duyệt
                  </h3>
                  <p className="text-gray-500">
                    Tất cả khách hàng đã được duyệt hoặc chưa có yêu cầu mới.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">
                          Tên công ty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[180px]">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
                          Điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
                          Loại KH
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">
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
                            <span className="block truncate max-w-[150px]">
                              {customer.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <span className="block truncate max-w-[180px]">
                              {customer.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <span className="block truncate max-w-[120px]">
                              {customer.phone}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
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
                                <UserCheck size={18} />
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
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersContent;