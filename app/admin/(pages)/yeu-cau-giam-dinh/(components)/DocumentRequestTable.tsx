import React, { useState, useMemo } from "react";
import {
  Trash2,
  RefreshCcw,
  ChevronDown,
  Filter,
  ArrowUpAZ,
  ArrowDownAZ,
  FileText,
} from "lucide-react"; // Added new icons
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/app/admin/component/document/ConfirmationModal";
import { customerApi } from "@/app/admin/services/customerApi";
import toast from "react-hot-toast";

type CustomerType = "IMPORTER" | "SERVICE_MANAGER";

interface DocumentRequest {
  customerId: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxCode: string;
  customerType: CustomerType | "IMPORTER" | "SERVICE_MANAGER";
  createdAt: string;
  note?: string;
  dob?: string | null;
  updatedAt?: string;
}

interface DocumentRequestTableProps {
  requests: DocumentRequest[];
  onRefresh?: () => void;
}

const customerTypeDisplayNames: Record<string, string> = {
  IMPORTER: "Nhà nhập khẩu",
  SERVICE_MANAGER: "Nhà quản lý dịch vụ",
};

type SortKey = keyof DocumentRequest | "none";
type SortOrder = "asc" | "desc";

const DocumentRequestTable: React.FC<DocumentRequestTableProps> = ({
  requests: initialRequests,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [, setUnapprovedError] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | CustomerType | "IMPORTER" | "EXPORTER"
  >("all");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc"); // Default to newest first

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  const handleClickPage = (id: number) => {
    router.push(`/admin/hoso/tao-ho-so/${id}`);
  };

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleDeleteCustomerById = async (customerId: number) => {
    setUnapprovedError("");
    try {
      await customerApi.deleteCustomerById(customerId);
      toast.success("Xóa hồ sơ thành công!");

      await handleRefresh();
    } catch (e: any) {
      setUnapprovedError(e?.message || "Xóa khách hàng thất bại");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSearchTerm("");
      setFilterType("all");
      setSortKey("createdAt"); // Reset sort key to createdAt
      setSortOrder("desc"); // Reset sort order to desc (newest)
      setCurrentPage(1);
      if (onRefresh) {
        onRefresh();
      }
    } catch (e: any) {
      setError(e?.message || "Không thể tải lại dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc"); // Default to ascending when changing sort key
    }
  };

  const filteredAndSortedRequests = useMemo(() => {
    let tempRequests = [...initialRequests]; // Create a mutable copy

    // 1. Filter
    if (filterType !== "all") {
      tempRequests = tempRequests.filter(
        (req) => req.customerType === filterType
      );
    }

    if (searchTerm) {
      tempRequests = tempRequests.filter(
        (req) =>
          req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.phone.includes(searchTerm) ||
          req.taxCode.includes(searchTerm) ||
          req.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sort
    if (sortKey !== "none") {
      tempRequests.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        // Handle string comparison (e.g., name, address, email)
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // Handle date comparison (e.g., createdAt)
        if (sortKey === "createdAt") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
        // Fallback for other types or numbers if needed
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return tempRequests;
  }, [initialRequests, filterType, searchTerm, sortKey, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? (
      <ArrowUpAZ size={14} />
    ) : (
      <ArrowDownAZ size={14} />
    );
  };

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {/* <div className="relative flex-1 min-w-[200px]">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm khách hàng..."
                                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div> */}

                <div className="relative inline-block w-full sm:w-56">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                    className="pl-9 pr-8 py-2.5 text-gray-800 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(
                        e.target.value as
                          | "all"
                          | CustomerType
                          | "IMPORTER"
                          | "EXPORTER"
                      );
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Tất cả loại khách hàng</option>
                    <option value="IMPORTER">Nhà nhập khẩu</option>
                    <option value="SERVICE_MANAGER">Nhà quản lý dịch vụ</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center text-sm px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 h-[42px]" // Adjusted height
                disabled={loading}
              >
                <RefreshCcw size={16} className="mr-2" /> Tải lại
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          KHÁCH HÀNG {getSortIcon("name")}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Số điện thoại
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase">
                        Loại khách hàng
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center">
                          Ngày tạo {getSortIcon("createdAt")}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((request) => (
                        <tr
                          key={request.customerId}
                          className="hover:bg-blue-50 transition-colors duration-200"
                        >
                          <td
                            className="px-6 py-4 text-sm text-gray-900 max-w-[180px] truncate"
                            title={request.name}
                          >
                            {request.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {request.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {request.phone}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                                request.customerType === "IMPORTER"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {customerTypeDisplayNames[request.customerType]}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleClickPage(request.customerId)
                                }
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                                title="Lên hồ sơ"
                              >
                                <FileText size={16} />
                              </button>
                              <button
                                onClick={() => openConfirm(request.customerId)}
                                className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredAndSortedRequests.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="text-gray-700">
                  Trang {currentPage} trên {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            )}
          </>
        )}
        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={async () => {
            if (selectedId) {
              await handleDeleteCustomerById(selectedId);
            }
            setConfirmOpen(false);
          }}
          title="Xác nhận xóa khách hàng"
          message="Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác."
        />
      </div>
    </>
  );
};

export default DocumentRequestTable;
