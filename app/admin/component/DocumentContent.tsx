// components/admin/DocumentsContent.tsx
"use client";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { InspectionReport, InspectionReportApi } from "../types/inspection";
import LoadingSpinner from "./document/LoadingSpinner";
import ErrorMessage from "./document/ErrorMessage";
import DocumentSearchBar from "./document/DocumentSearchBar";
import DocumentMobileCard from "./document/DocumentMobileCard";
import DocumentsTable from "./document/DocumentsTable";
import { useRouter } from "next/navigation";
import DocumentViewModal from "./document/DocumentViewModal";
import toast from "react-hot-toast";
import ConfirmationModal from "./document/ConfirmationModal"; // Import the new ConfirmationModal

const BACKEND_URL  = process.env.BACKEND_URL  || "http://localhost:8080";
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

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const signal = controller.signal;

      const response = await fetch("/api/dossiers?page=0&size=5", { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const mappedDocuments: InspectionReport[] = data.content.map(
        (apiDoc: InspectionReportApi) => ({
          receiptId: apiDoc.receiptId,
          registrationNo: apiDoc.registrationNo,
          customerSubmitId: apiDoc.customerSubmitId,
          customerRelatedId: apiDoc.customerRelatedId, // Đây vẫn là ID khách hàng
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
          client: `${apiDoc.customerRelatedId}`, // Tạm thời hiển thị ID
          inspector: "N/A",
          date: new Date(apiDoc.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          type: apiDoc.inspectionTypeId,
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
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers for document actions
  // View, Download, Edit, Delete
  // View
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

  // Edit
  const handleEdit = (id: string) => {
    router.push(`/admin/ho-so/chinh-sua/${id}`);
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

  // Function to open confirmation modal
  const confirmDelete = (id: string) => {
    setDocToDelete(id);
    setIsConfirmModalOpen(true);
  };

  // Function to handle the actual deletion after confirmation
  const handleDelete = async () => {
    if (!docToDelete) return; // Should not happen if modal is open

    try {
      const response = await axios.delete(`/api/dossiers/${docToDelete}`);

      if (response.status === 200 || response.status === 204) {
        // Update the documents state to remove the deleted document
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
      setIsConfirmModalOpen(false); // Close modal
      setDocToDelete(null); // Reset doc to delete
    }
  };

  const handleCreateNewDocument = () => {
    console.log("Create new document");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen">
      {/* Search and Filter Bar */}
      <DocumentSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onCreateNew={handleCreateNewDocument}
      />

      {/* Documents - Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-10 text-lg text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            Không tìm thấy tài liệu nào.
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentMobileCard
              key={doc.id}
              document={doc}
              onView={handleView}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={confirmDelete} // Use confirmDelete here
            />
          ))
        )}
      </div>

      {/* Documents Table - Desktop */}
      <DocumentsTable
        documents={filteredDocuments}
        onView={handleView}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onDelete={confirmDelete} // Use confirmDelete here
      />

      <DocumentViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDoc}
      />

      {/* Confirmation Modal */}
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
