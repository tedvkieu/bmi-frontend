// app/components/DocumentsContent.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { dossierApi, StatusUpdateResponse } from "../services/dossierApi";
import { InspectionReport } from "../types/inspection";
import DocumentsTable from "./document/DocumentsTable";
import DocumentMobileCard from "./document/DocumentMobileCard";
import LoadingSpinner from "./document/LoadingSpinner";
import ErrorMessage from "./document/ErrorMessage";
import ConfirmationModal from "./document/ConfirmationModal";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IoDocumentOutline } from "react-icons/io5"; // Keep for Total Documents
import DocumentSearchBar from "./DocumentSearchBar";
import DossierViewModal from "../(pages)/hoso/(components)/DossierViewModal";
import { DossierDetails } from "@/app/types/dossier";
import StatCard from "./StatCard";

interface OverallStatusCounts {
  total: number;
  completed: number;
  pending: number;
  notObtained: number;
  notWithinScope: number;
}

const DocumentsContent: React.FC = () => {
  const router = useRouter();

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = String(now.getFullYear());

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    InspectionReport["status"] | "all"
  >("all"); // Default to "all"
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [yearFilter, setYearFilter] = useState<string>(currentYear);

  // Data states
  const [documents, setDocuments] = useState<InspectionReport[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
  const [errorDocuments, setErrorDocuments] = useState<string | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<DossierDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  // Pagination states for the current table view
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Overall counts states
  const [overallCounts, setOverallCounts] = useState<OverallStatusCounts>({
    total: 0,
    completed: 0,
    pending: 0,
    notObtained: 0,
    notWithinScope: 0,
  });
  const [loadingOverallCounts, setLoadingOverallCounts] =
    useState<boolean>(true);

  const fetchOverallCounts = useCallback(async () => {
    setLoadingOverallCounts(true);
    try {
      const counts = await dossierApi.getOverallCounts(monthFilter, yearFilter);
      setOverallCounts(counts);
    } catch (err: any) {
      console.error("Failed to fetch overall document counts:", err);
    } finally {
      setLoadingOverallCounts(false);
    }
  }, [monthFilter, yearFilter]);

  const fetchDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    setErrorDocuments(null);
    try {
      const data = await dossierApi.getDocuments(
        currentPage,
        pageSize,
        sortBy,
        searchTerm,
        monthFilter,
        yearFilter,
        statusFilter === "all" ? statusFilter : statusFilter
      );

      const mappedDocuments: InspectionReport[] = data.pageData.content.map(
        (doc: any) => ({
          id: String(doc.receiptId),
          name:
            doc.registrationNo ||
            doc.billOfLading ||
            `Document ${doc.receiptId}`,
          client: doc.customerSubmit?.name || "",
          inspector: doc.createdByUserName || "N/A",
          date: new Date(doc.createdAt).toLocaleDateString("vi-VN"),
          type: doc.inspectionTypeName || doc.inspectionTypeId,
          status: doc.certificateStatus.toLowerCase() as
            | "obtained"
            | "pending"
            | "not_obtained"
            | "not_within_scope",
          ...doc,
        })
      );

      setDocuments(mappedDocuments);
      setTotalElements(data.pageData.page.totalElements);
      setTotalPages(data.pageData.page.totalPages);
    } catch (err: any) {
      setErrorDocuments(err.message);
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    searchTerm,
    statusFilter,
    monthFilter,
    yearFilter,
  ]);

  // Effects to fetch data when filters or pagination change
  useEffect(() => {
    fetchOverallCounts();
  }, [fetchOverallCounts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 500); // Debounce fetch for filters

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    sortBy,
    monthFilter,
    yearFilter,
    currentPage, // Include currentPage to trigger fetch on page change
    fetchDocuments, // Add fetchDocuments to dependency array
  ]);

  // Debounced search term update
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      setCurrentPage(0); // Reset page on new search
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm]);

const handleStatusChange = useCallback(
    async (
      id: string,
      newStatus: InspectionReport["status"]
    ): Promise<StatusUpdateResponse> => {
      try {
        const result = await dossierApi.updateDocumentStatus(id, newStatus);

        if (!result.success) {
          return result;
        }

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, status: newStatus } : doc
          )
        );

        fetchOverallCounts();

        return result;
      } catch (error) {
        console.error("Failed to update status:", error);
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        };
      }
    },
    [fetchOverallCounts]
  );

  // Handlers for filter changes
  const handleStatusFilterChange = useCallback(
    (filter: InspectionReport["status"] | "all") => {
      setStatusFilter(filter);
      setCurrentPage(0); // Reset page on filter change
    },
    []
  );

  const handleSortChange = useCallback((sort: "newest" | "oldest") => {
    setSortBy(sort);
    setCurrentPage(0);
  }, []);

  const handleMonthFilterChange = useCallback((month: string) => {
    setMonthFilter(month);
    setCurrentPage(0);
  }, []);

  const handleYearFilterChange = useCallback((year: string) => {
    setYearFilter(year);
    setCurrentPage(0);
  }, []);

  const handleView = useCallback(async (id: string) => {
    try {
      const data = await dossierApi.getDocumentByIdDetails(id);
      if (data) {
        setSelectedDoc(data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("View error:", err);
      toast.error("Không thể lấy dữ liệu biên lai");
    }
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/hoso/${id}`);
    },
    [router]
  );

  const handleDownload = useCallback(async (id: string) => {
    try {
      toast.loading("Đang tạo và tải file...", { id: "downloadToast" });

      const blob = await dossierApi.downloadInspectionReport(id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inspection_report_${id}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File đã được tải xuống!", { id: "downloadToast" });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Có lỗi xảy ra khi tải file", {
        id: "downloadToast",
      });
    }
  }, []);

  const confirmDelete = useCallback((id: string) => {
    setDocToDelete(id);
    setIsConfirmModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDocuments();
    fetchOverallCounts();
    toast.success("Dữ liệu đã được làm mới!");
  }, [fetchDocuments, fetchOverallCounts]);

  const handleDelete = useCallback(async () => {
    if (!docToDelete) return;
    try {
      await dossierApi.deleteDocument(docToDelete);
      toast.success("Đã xóa biên lai");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Xóa thất bại");
    } finally {
      setIsConfirmModalOpen(false);
      setDocToDelete(null);
      handleRefresh(); // Refresh all data after deletion
    }
  }, [docToDelete, handleRefresh]);

  const handleDeleteMany = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      try {
        toast.loading(`Đang xóa ${ids.length} biên lai...`, {
          id: "deleteManyToast",
        });
        const deletePromises = ids.map((id) => dossierApi.deleteDocument(id));
        await Promise.all(deletePromises);
        toast.success(`Đã xóa thành công ${ids.length} biên lai.`, {
          id: "deleteManyToast",
        });
      } catch (error) {
        console.error("Error while deleting multiple receipts:", error);
        toast.error("Không thể xóa các biên lai đã chọn, vui lòng thử lại.", {
          id: "deleteManyToast",
        });
      } finally {
        handleRefresh(); // Refresh all data after deletion
      }
    },
    [handleRefresh]
  );

  // Memoized Pagination component
  const Pagination = useMemo(() => {
    if (typeof totalElements !== "number" || totalElements <= 0) {
      return null;
    }
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    const renderPageButtons = () => {
      const buttons = [];
      const maxButtons = 5;
      let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
      const endPage = Math.min(totalPages, startPage + maxButtons);

      // Adjust startPage if we don't have enough pages at the end
      if (endPage - startPage < maxButtons) {
        startPage = Math.max(0, totalPages - maxButtons);
      }

      for (let i = startPage; i < endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border text-sm font-medium ${i === currentPage
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }`}
          >
            {i + 1}
          </button>
        );
      }
      return buttons;
    };

    if (totalElements === 0) return null; // Don't render pagination if no elements

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
              <span className="font-medium">{totalElements}</span> tài liệu
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

              {renderPageButtons()}

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
  }, [currentPage, pageSize, totalElements, totalPages]);

  // If there's a global error, display it prominently
  if (errorDocuments) return <ErrorMessage message={errorDocuments} />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm text-black space-y-4">
        <DocumentSearchBar
          searchTerm={searchTerm}
          localSearchTerm={localSearchTerm}
          setLocalSearchTerm={setLocalSearchTerm}
          onSearch={() => setSearchTerm(localSearchTerm)}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          monthFilter={monthFilter}
          setMonthFilter={handleMonthFilterChange}
          yearFilter={yearFilter}
          setYearFilter={handleYearFilterChange}
          onRefresh={handleRefresh}
        />
      </div>


      <div className="bg-white p-4 rounded-xl shadow-sm text-black space-y-4">


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Tất cả"
            count={overallCounts.total}
            onClick={() => handleStatusFilterChange("all")}
            isActive={statusFilter === "all"}
            isLoading={loadingOverallCounts}
          />

          <StatCard
            title="Đang xử lý"
            count={overallCounts.pending}
            onClick={() => handleStatusFilterChange("pending")}
            isActive={statusFilter === "pending"}
            isLoading={loadingOverallCounts}
          />

          <StatCard
            title="Đã hoàn thành"
            count={overallCounts.completed}
            onClick={() => handleStatusFilterChange("obtained")}
            isActive={statusFilter === "obtained"}
            isLoading={loadingOverallCounts}
          />

          <StatCard
            title="Không hoàn thành"
            count={overallCounts.notObtained}
            onClick={() => handleStatusFilterChange("not_obtained")}
            isActive={statusFilter === "not_obtained"}
            isLoading={loadingOverallCounts}
          />

          <StatCard
            title="Ngoài phạm vi"
            count={overallCounts.notWithinScope}
            onClick={() => handleStatusFilterChange("not_within_scope")}
            isActive={statusFilter === "not_within_scope"}
            isLoading={loadingOverallCounts}
          />
        </div>
        <div className="block lg:hidden space-y-4">
          {loadingDocuments ? (
            <LoadingSpinner />
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-lg text-gray-500 rounded-xl border border-gray-200">
              <IoDocumentOutline
                size={48}
                className="mx-auto mb-4 text-gray-400"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy tài liệu nào
              </h3>
              <p className="text-black">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>

          ) : (
            documents.map((doc) => (
              <DocumentMobileCard
                key={doc.id}
                document={doc}
                onView={handleView}
                onDelete={confirmDelete}
                onDownload={handleDownload}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        <div className="hidden lg:block">
          {loadingDocuments ? (
            <LoadingSpinner />
          ) : (
            <DocumentsTable
              documents={documents}
              onView={handleView}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={confirmDelete}
              onDeleteMany={handleDeleteMany}
              onStatusChange={handleStatusChange}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>

      {isModalOpen && selectedDoc && (
        <DossierViewModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          document={selectedDoc}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa biên lai"
        message="Bạn có chắc chắn muốn xóa biên lai này? Hành động này không thể hoàn tác."
      />

      {Pagination}
    </div>
  );
};

export default DocumentsContent;