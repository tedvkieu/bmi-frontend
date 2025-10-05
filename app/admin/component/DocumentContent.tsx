"use client";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { InspectionReport, InspectionReportApi } from "../types/inspection";
import LoadingSpinner from "./document/LoadingSpinner";
import ErrorMessage from "./document/ErrorMessage";
import DocumentSearchBar from "./document/DocumentSearchBar";
import DocumentMobileCard from "./document/DocumentMobileCard";
import DocumentsTable from "./document/DocumentsTable"; // Đảm bảo đã cập nhật DocumentsTable.tsx như câu trả lời trước
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const DocumentViewModal = dynamic(
  () => import("./document/DocumentViewModal"),
  { ssr: false }
);
import toast from "react-hot-toast";
import ConfirmationModal from "./document/ConfirmationModal";
import { CheckCircle, Clock } from "lucide-react";
import { IoDocumentOutline } from "react-icons/io5";

const BACKEND_URL = process.env.BACKEND_URL;

const DocumentsContent = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    InspectionReport["status"] | "all"
  >("all");
  const [documents, setDocuments] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<InspectionReportApi | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  // <-- THÊM STATE sortBy
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest"); // Mặc định sắp xếp mới nhất

  // Cập nhật hàm fetchDocuments để nhận tham số sắp xếp
  const fetchDocuments = useCallback(
    async (currentSortBy: "newest" | "oldest" = "newest") => {
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const signal = controller.signal;

        // <-- TRUYỀN THAM SỐ sortBy VÀO API CALL
        const response = await fetch(
          `/api/dossiers?page=0&size=50&sortBy=${currentSortBy}`,
          { signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const mappedDocuments: InspectionReport[] = data.content.map(
          (apiDoc: InspectionReportApi) => ({
            receiptId: apiDoc.receiptId,
            registrationNo: apiDoc.registrationNo,
            customerSubmitId: apiDoc.customerSubmitId,
            customerRelatedId: apiDoc.customerRelatedId,
            inspectionTypeId: apiDoc.inspectionTypeId,
            declarationNo: apiDoc.declarationNo,
            billOfLading: apiDoc.billOfLading,
            shipName: apiDoc.shipName,
            cout10: apiDoc.cout10,
            cout20: apiDoc.cout20,
            bulkShip: apiDoc.bulkShip,
            declarationDoc: apiDoc.declarationDoc,
            declarationPlace: apiDoc.declarationPlace,
            inspectionDate: apiDoc.inspectionDate,
            certificateDate: apiDoc.certificateDate,
            inspectionLocation: apiDoc.inspectionLocation,
            certificateStatus: apiDoc.certificateStatus,
            createdAt: apiDoc.createdAt,
            updatedAt: apiDoc.updatedAt,

            id: String(apiDoc.receiptId),
            name:
              apiDoc.registrationNo ||
              apiDoc.billOfLading ||
              `Document ${apiDoc.receiptId}`,
            client: `${
              apiDoc.customerRelatedName || apiDoc.customerRelatedId || ""
            }`,
            inspector: "N/A",
            date: new Date(apiDoc.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            type: apiDoc.inspectionTypeName || apiDoc.inspectionTypeId,
            status: apiDoc.certificateStatus.toLowerCase() as
              | "completed"
              | "pending"
              | "in_progress",
          })
        );
        setDocuments(mappedDocuments);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message);
          console.error("Failed to fetch documents:", e);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  ); // Không cần sortBy trong dependency array vì nó được truyền vào

  useEffect(() => {
    fetchDocuments(sortBy); // Gọi fetchDocuments với sortBy hiện tại
  }, [fetchDocuments, sortBy]); // <-- THÊM sortBy VÀO DEPENDENCY ARRAY

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    let completed = 0;
    let pending = 0;
    let inProgress = 0;

    documents.forEach((doc) => {
      if (doc.status === "obtained") {
        completed++;
      } else if (doc.status === "pending") {
        pending++;
      } else if (
        doc.status === "not_obtained" ||
        doc.status === "not_within_scope"
      ) {
        inProgress++;
      }
    });
    return { completed, pending, inProgress };
  };

  const statusCounts = getStatusCounts();

  const handleView = async (id: string) => {
    try {
      const response = await axios.get(`/api/dossiers/${id}`);
      if (response.data) {
        setSelectedDoc(response.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error while fetching receipt:", error);
      toast.error("Không thể lấy dữ liệu biên lai, vui lòng thử lại.");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/hoso/${id}`);
  };

  const handleDownload = async (id: string) => {
    console.log("Download document:", id);
    try {
      // 1. Gọi API generate inspection report
      const res = await fetch(
        `/api/documents/generate-inspection-report/${id}`
      );

      console.log("Generate report response:", res);

      if (!res.ok) {
        throw new Error("Không thể generate report");
      }

      const data = await res.json();
      console.log("API response:", data);

      // 2. Lấy tên file
      const fileName = data.files;

      console.log("File name:", fileName);
      if (!fileName) {
        throw new Error("Không có tên file trả về");
      }

      // 3. Gọi API export để lấy file (blob)
      const fileRes = await fetch(`${BACKEND_URL}/api/exports/${fileName}`);

      if (!fileRes.ok) {
        throw new Error("Không thể tải file");
      }

      const blob = await fileRes.blob();

      // 4. Tạo link download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // gợi ý tên file tải xuống
      document.body.appendChild(link);
      link.click();

      // cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File đã được tải xuống!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tạo hoặc tải file");
    }
  };

  const confirmDelete = (id: string) => {
    setDocToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;

    try {
      const response = await axios.delete(`/api/dossiers/${docToDelete}`);

      if (response.status === 200 || response.status === 204) {
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.id !== docToDelete)
        );
        toast.success("Biên lai đã được xoá thành công!");
      } else {
        toast.error("Không thể xoá biên lai, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error while deleting receipt:", error);
      toast.error("Không thể xoá biên lai, vui lòng thử lại.");
    } finally {
      setIsConfirmModalOpen(false);
      setDocToDelete(null);
      fetchDocuments(sortBy); // <-- Làm mới sau khi xóa với sortBy hiện tại
    }
  };

  const handleDeleteMany = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      // Assuming a batch delete API endpoint or individual deletes
      const deletePromises = ids.map((id) =>
        axios.delete(`/api/dossiers/${id}`)
      );
      await Promise.all(deletePromises);

      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => !ids.includes(doc.id))
      );
      toast.success(`Đã xóa thành công ${ids.length} biên lai.`);
    } catch (error) {
      console.error("Error while deleting multiple receipts:", error);
      toast.error("Không thể xóa các biên lai đã chọn, vui lòng thử lại.");
    } finally {
      fetchDocuments(sortBy); // <-- Làm mới sau khi xóa nhiều với sortBy hiện tại
    }
  };

  // <-- CẬP NHẬT HÀM handleRefresh ĐỂ NHẬN THAM SỐ sortBy
  const handleRefresh = (newSortBy?: "newest" | "oldest") => {
    const currentSort = newSortBy || sortBy; // Ưu tiên newSortBy nếu có, nếu không thì dùng sortBy hiện tại
    setSortBy(currentSort); // Cập nhật state sortBy của DocumentsContent
    fetchDocuments(currentSort); // Tải lại dữ liệu với lựa chọn sắp xếp mới
    toast.success("Dữ liệu đã được làm mới!");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Thẻ Tổng số tài liệu */}
        <div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                  transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-300 hover:scale-[1.01] cursor-default"
        >
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full">
            <IoDocumentOutline size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Tổng số tài liệu
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {documents.length}
            </p>
          </div>
        </div>

        {/* Thẻ Tài liệu hoàn thành */}
        <div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                  transition-all duration-300 ease-in-out hover:shadow-md hover:border-green-300 hover:scale-[1.01] cursor-default"
        >
          <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
            <p className="text-2xl font-semibold text-gray-900">
              {statusCounts.completed}
            </p>
          </div>
        </div>

        {/* Thẻ Tài liệu đang xử lý */}
        <div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4
                  transition-all duration-300 ease-in-out hover:shadow-md hover:border-yellow-300 hover:scale-[1.01] cursor-default"
        >
          <div className="flex-shrink-0 bg-yellow-100 text-yellow-600 p-3 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
            <p className="text-2xl font-semibold text-gray-900">
              {statusCounts.inProgress}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-black space-y-4">
        <DocumentSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onCreateNew={() => router.push("/admin/hoso/tao-ho-so")}
        />

        {/* Documents - Mobile Cards */}
        <div className="block lg:hidden space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-10 text-lg text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
              <IoDocumentOutline
                size={48}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy tài liệu nào
              </h3>
              <p className="text-black">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <DocumentMobileCard
                key={doc.id}
                document={doc}
                onView={handleView}
                onDownload={handleDownload}
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>

        {/* Documents Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DocumentsTable
            documents={filteredDocuments}
            onView={handleView}
            onDownload={handleDownload}
            onEdit={handleEdit}
            onDelete={confirmDelete}
            onRefresh={handleRefresh}
            onDeleteMany={handleDeleteMany}
          />
        </div>

        {/* No results for desktop table */}
        {filteredDocuments.length === 0 && !loading && (
          <div className="hidden lg:block text-center py-12">
            <IoDocumentOutline
              size={48}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy tài liệu nào
            </h3>
            <p className="text-black">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && selectedDoc && (
        <DocumentViewModal
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
    </div>
  );
};

export default DocumentsContent;
