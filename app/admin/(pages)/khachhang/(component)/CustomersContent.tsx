// components/admin/CustomersContent.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Users, UserX, Mail, Phone, Calendar, MoreVertical, FileText, Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoMdCheckmark } from "react-icons/io";
import { customerApi, UnactiveCustomer, Customer, CustomerResponse } from "@/app/admin/services/customerApi";
import { authApi } from "@/app/services/authApi";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import ConfirmationModal from "@/app/admin/component/document/ConfirmationModal";
import CustomersPagination from "./CustomersPagination";
import useDebounce from "../../../../hooks/useDebounce";
import CustomersNavbar from "./CustomerNavbar";
import CustomersTable from "./CustomerTable";

const CustomersContent = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true); // Đổi tên để rõ ràng hơn
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<"all" | "IMPORTER" | "SERVICE_MANAGER">("all");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const router = useRouter();

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.customerId));
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    if (isMultiSelectMode) {
      setSelectedCustomers([]);
    }
  };

  const openConfirm = (id: number | null) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleDeleteSelectedCustomers = async () => {
    setUnapprovedError("");
    try {
      if (selectedId === null && selectedCustomers.length > 0) {
        for (const id of selectedCustomers) {
          await customerApi.deleteCustomerById(id);
        }
        toast.success(`Xóa thành công ${selectedCustomers.length} tài khoản khách hàng`);
        setSelectedCustomers([]);
        setIsMultiSelectMode(false);
      } else if (selectedId !== null) {
        await customerApi.deleteCustomerById(selectedId);
        toast.success("Xóa thành công!");
      }
      fetchCustomers();
    } catch (e: any) {
      setUnapprovedError(e?.message || "Xóa khách hàng thất bại");
      toast.error("Xóa khách hàng thất bại");
    } finally {
      setConfirmOpen(false);
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
      setIsLoadingCustomers(true); // Bắt đầu loading cho bảng
      const data: CustomerResponse = await customerApi.getAllCustomers(
        currentPage,
        pageSize,
        debouncedSearchTerm,
        customerTypeFilter
      );
      setCustomers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Không thể tải danh sách khách hàng.");
    } finally {
      setIsLoadingCustomers(false); // Kết thúc loading cho bảng
    }
  }, [currentPage, debouncedSearchTerm, customerTypeFilter, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchUnactiveCount();
  }, [fetchUnactiveCount]);

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
    fetchUnactiveCount();
  };

  const handleApproveCustomer = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.approveCustomer(customerId);
      await loadUnapprovedCustomers();
      toast.success("Khách hàng đã được duyệt thành công!");
    } catch (e: any) {
      toast.error(e?.message || "Duyệt khách hàng thất bại");
    }
  };

  const handleDeleteCustomerById = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.deleteCustomerById(customerId);
      fetchCustomers();
      toast.success("Xóa thành công!");
    } catch (e: any) {
      setUnapprovedError(e?.message || "Xóa khách hàng thất bại");
      toast.error(e?.message || "Xóa khách hàng thất bại");
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
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
      toast.error(e?.message || "Từ chối khách hàng thất bại");
    }
  };

  const handleOpenViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleCustomerTypeFilter = (value: "all" | "IMPORTER" | "SERVICE_MANAGER") => {
    setCustomerTypeFilter(value);
    setCurrentPage(0);
  };

  const onRefresh = () => {
    fetchCustomers();
    fetchUnactiveCount();
    toast.success("Dữ liệu đã được làm mới!");
  }

  const handleAddNewCustomer = () => {
    router.push("/admin/khachhang/them-moi-khach-hang");
  };

  const handleEditCustomer = (customerId: number) => {
    router.push(`/admin/khachhang/${customerId}`);
  };

  const handleClickPageForProfile = (id: number) => {
    router.push(`/admin/hoso/tao-ho-so/${id}`);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  // Loại bỏ điều kiện loading toàn bộ trang ở đây
  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <div className="space-y-6">
      <CustomersNavbar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        customerTypeFilter={customerTypeFilter}
        onCustomerTypeFilterChange={handleCustomerTypeFilter}
        totalElements={totalElements}
        unactiveCount={unactiveCount}
        loadingUnapproved={loadingUnapproved}
        openUnapprovedCustomersModal={openUnapprovedCustomersModal}
        onAddNewCustomer={handleAddNewCustomer}
        onRefresh={onRefresh}
        isMultiSelectMode={isMultiSelectMode}
        toggleMultiSelectMode={toggleMultiSelectMode}
        selectedCustomersCount={selectedCustomers.length}
        onDeleteSelected={() => openConfirm(null)}
      />

      {/* Customers Table - Desktop */}
      <div className="hidden lg:block">
        <CustomersTable
          customers={customers}
          isMultiSelectMode={isMultiSelectMode}
          selectedCustomers={selectedCustomers}
          handleSelectAllCustomers={handleSelectAllCustomers}
          handleSelectCustomer={handleSelectCustomer}
          onOpenViewModal={handleOpenViewModal}
          onEditCustomer={handleEditCustomer}
          onOpenConfirm={openConfirm}
          onRefresh={onRefresh}
          toggleMultiSelectMode={toggleMultiSelectMode}
          selectedCustomersCount={selectedCustomers.length}
          onDeleteSelected={() => openConfirm(null)}
          loading={isLoadingCustomers}
        />
        {totalPages > 1 && (
            <CustomersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
            />
        )}
      </div>

      {/* Customers - Mobile Cards */}
      <div className="block lg:hidden space-y-4 relative"> {/* Add relative for mobile spinner */}
        {isLoadingCustomers && ( // Spinner cho mobile cards
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                <LoadingSpinner />
            </div>
        )}
        {customers.length === 0 && !isLoadingCustomers ? ( // "Không có dữ liệu" cho mobile
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">
                    Hiện tại chưa có khách hàng nào
                </h3>
                <p className="text-black text-sm">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn hoặc duyệt tài khoản khách hàng.
                </p>
            </div>
        ) : (
            customers.map((customer) => (
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
                    onClick={() => handleOpenViewModal(customer)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                    title="Xem chi tiết"
                    >
                    <Eye size={16} />
                    </button>
                    <button
                    onClick={() => handleClickPageForProfile(customer.customerId)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                    title="Lên hồ sơ"
                    >
                    <FileText size={16} />
                    </button>
                    <button
                    onClick={() => handleEditCustomer(customer.customerId)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                    title="Chỉnh sửa"
                    >
                    <Edit2 size={16} />
                    </button>
                    <button
                    onClick={() => openConfirm(customer.customerId)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                    title="Xóa"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
                </div>
            </div>
            ))
        )}
        {totalPages > 1 && (
            <CustomersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
            />
        )}
      </div>

      {/* Loại bỏ phần "No results" chung ở đây vì nó đã được xử lý trong table và mobile cards */}
      {/* {customers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Hiện tại chưa có khách hàng nào
          </h3>
          <p className="text-black text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn hoặc duyệt tài khoản khách hàng.
          </p>
        </div>
      )} */}

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
                            <span className="block max-w-[150px]">
                              {customer.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            <span className="block max-w-[180px]">
                              {customer.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black">
                            <span className="block max-w-[120px]">
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

      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={handleCloseViewModal}
          />
          <div className="relative bg-white w-full max-w-4xl mx-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-gray-600 text-white rounded-t-lg flex items-center justify-between">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khách hàng
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.customerId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.dob)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cập nhật gần nhất
                  </label>
                  <p className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {formatDate(selectedCustomer.updatedAt)}
                  </p>
                </div>
              </div>
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
              <button
                type="button"
                onClick={() => handleEditCustomer(selectedCustomer.customerId)}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
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
        onConfirm={() => {
          if (isMultiSelectMode && selectedCustomers.length > 0) {
            handleDeleteSelectedCustomers();
          } else if (selectedId !== null) {
            handleDeleteCustomerById(selectedId);
          }
        }}
        title={
          isMultiSelectMode && selectedCustomers.length > 0
            ? `Xác nhận xóa ${selectedCustomers.length} khách hàng`
            : "Xác nhận xóa khách hàng"
        }
        message={
          isMultiSelectMode && selectedCustomers.length > 0
            ? `Bạn có chắc chắn muốn xóa ${selectedCustomers.length} khách hàng đã chọn không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác."
        }
      />
    </div>
  );
};

export default CustomersContent;