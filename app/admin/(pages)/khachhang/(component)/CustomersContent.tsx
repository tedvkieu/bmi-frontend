"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserX, Mail, Phone, Calendar, MoreVertical, FileText, Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoMdCheckmark } from "react-icons/io";
import { customerApi, UnactiveCustomer, Customer } from "@/app/admin/services/customerApi";
import { authApi } from "@/app/services/authApi";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import ConfirmationModal from "@/app/admin/component/document/ConfirmationModal";
import CustomersPagination from "./CustomersPagination";
import useDebounce from "../../../../hooks/useDebounce";
import CustomersNavbar from "./CustomerNavbar";
import CustomersTable from "./CustomerTable";

const CustomersContent = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<"all" | "IMPORTER" | "SERVICE_MANAGER">("all");

  const [currentPage, setCurrentPage] = useState(0); // Luôn là 0-indexed (API page)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20; // Đặt pageSize cố định, dùng cho cả API và UI

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [gotoPageInput, setGotoPageInput] = useState<string>("");

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

  // Hàm thay đổi trang (luôn nhận 0-indexed page number)
  const handlePageChange = (page: number) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages)) {
      console.warn("Invalid page number attempted:", page);
      return;
    }
    setCurrentPage(page);
  };

  const handleGotoPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gotoPageInput) return;
    const nextPageUi = Number.parseInt(gotoPageInput, 10); // Nhận UI page (1-indexed)
    if (Number.isFinite(nextPageUi) && nextPageUi >= 1 && nextPageUi <= totalPages) {
      handlePageChange(nextPageUi - 1); // Chuyển sang 0-indexed trước khi gọi
    } else {
      toast.error(`Số trang không hợp lệ. Vui lòng nhập số từ 1 đến ${totalPages}.`);
    }
    setGotoPageInput("");
  };

  const resultsRange = useMemo(() => {
    if (!totalElements || customers.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage * pageSize) + 1;
    const end = Math.min(start + customers.length - 1, totalElements);
    return { start, end };
  }, [currentPage, pageSize, totalElements, customers.length]);

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length && customers.length > 0) {
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
      setSelectedId(null);
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
      setIsLoadingCustomers(true);

      const data = await customerApi.getAllCustomers(
        currentPage, // ✅ Spring Boot 0-index
        pageSize,
        debouncedSearchTerm,
        customerTypeFilter
      );

      const content = data.content ?? [];
      const totalElements = data.page?.totalElements ?? 0;
      const newTotalPages = data.page?.totalPages ?? 0;

      setCustomers(content);
      setTotalElements(totalElements);
      setTotalPages(newTotalPages);

      // ✅ Nếu currentPage vượt quá totalPages (sau khi lọc hoặc xóa)
      // Điều chỉnh currentPage về trang cuối cùng có dữ liệu nếu nó vượt quá giới hạn
      if (newTotalPages > 0 && currentPage >= newTotalPages) {
        setCurrentPage(newTotalPages - 1);
      } else if (newTotalPages === 0 && currentPage !== 0) {
        // Nếu không có trang nào nhưng currentPage không phải 0
        setCurrentPage(0);
      }

      console.log(
        `Page ${currentPage + 1}/${newTotalPages} (${totalElements} items)`
      );
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Không thể tải danh sách khách hàng.");
      setCustomers([]);
      setTotalElements(0);
      setTotalPages(0);
      setCurrentPage(0); // Reset về trang 0 khi có lỗi
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, customerTypeFilter]);

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
    setCurrentPage(0); // Reset về trang đầu tiên (0-indexed) khi tìm kiếm mới
  };

  const handleCustomerTypeFilter = (value: "all" | "IMPORTER" | "SERVICE_MANAGER") => {
    setCustomerTypeFilter(value);
    setCurrentPage(0); // Reset về trang đầu tiên (0-indexed) khi thay đổi bộ lọc
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

  const handleCreateDossierForCustomer = async (customerId: number) => {
    const toastId = toast.loading("Đang khởi tạo hồ sơ mới...");
    try {
      const draft = await customerApi.createDraftDossier(customerId);
      toast.success("Đã tạo hồ sơ nháp cho khách hàng", { id: toastId });
      router.push(`/admin/hoso/tao-ho-so/${draft.receiptId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể khởi tạo hồ sơ cho khách hàng";
      toast.error(message, { id: toastId });
    }
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
        return "Đơn vị nhập khẩu";
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

  // Logic hiển thị nút phân trang cho mobile (tương tự như CustomersPagination getPageNumbers)
  const getMobilePaginationNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = 0;
    let endPage = totalPages - 1;

    if (totalPages > maxPageButtons) {
      startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
      endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

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
          onCreateDossier={handleCreateDossierForCustomer}
        />
        {/* Phân trang cho desktop */}
        {totalPages > 0 && ( // totalPages > 0 để hiển thị phân trang
          <CustomersPagination
            currentPage={currentPage} // Truyền 0-indexed page number
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange} // Nhận 0-indexed page number
          />
        )}
      </div>

      {/* Customers - Mobile Cards */}
      <div className="block lg:hidden space-y-4 relative">
        {isLoadingCustomers && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
            <LoadingSpinner />
          </div>
        )}
        {customers.length === 0 && !isLoadingCustomers ? (
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-3">
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 leading-tight break-words whitespace-normal">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {customer.customerId}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  {/* Option menu (if needed) */}
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-start gap-2">
                  <Mail size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 break-words">
                    {customer.email}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 break-words">
                    {customer.phone}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
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
                    onClick={() => handleCreateDossierForCustomer(customer.customerId)}
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
        {totalElements > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-700 font-medium">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">
                {resultsRange.start}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-900">
                {resultsRange.end}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-900">
                {totalElements}
              </span>{" "}
              người dùng
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)} // Gọi với 0-indexed page number
                disabled={currentPage === 0 || isLoadingCustomers}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>

              <div className="flex items-center gap-1">
                {getMobilePaginationNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)} // Gọi với 0-indexed page number
                    disabled={isLoadingCustomers}
                    className={`min-w-[36px] px-3 py-1.5 rounded-md text-sm font-medium transition-all ${pageNum === currentPage
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {pageNum + 1} {/* Hiển thị cho người dùng là 1-indexed */}
                  </button>
                ))}
              </div>

              {totalPages > 0 && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)} // Gọi với 0-indexed page number
                  disabled={currentPage === totalPages - 1 || isLoadingCustomers}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp →
                </button>
              )}

              <form
                onSubmit={handleGotoPageSubmit}
                className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300"
              >
                <span className="text-sm text-gray-700">Đến trang</span>
                <input
                  value={gotoPageInput}
                  onChange={(e) => setGotoPageInput(e.target.value)}
                  placeholder={(currentPage + 1).toString()} // Hiển thị UI page (1-indexed)
                  className="w-14 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  inputMode="numeric"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Đi
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

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
          <div className="relative bg-white w-full max-w-7xl mx-auto rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-blue-600 text-white  flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                Khách hàng {selectedCustomer.name}
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
                  <p className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800">
                    {selectedCustomer?.dob
                      ? formatDate(selectedCustomer.dob)
                      : <span className="text-gray-400 italic">Chưa cập nhật</span>}
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
                  <p className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800">
                    {selectedCustomer?.address
                      ? selectedCustomer.address
                      : <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò khách hàng
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
                    Ngày tạo tài khoản
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
