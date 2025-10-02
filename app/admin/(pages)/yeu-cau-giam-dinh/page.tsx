// app/admin/document-request/page.tsx
"use client"
import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import DocumentRequestTable from "./(components)/DocumentRequestTable";
import LoadingSpinner from "../../component/document/LoadingSpinner";

// Define DocumentRequest interface locally or import from a shared types file
// For this example, I'll redefine it based on the API response structure
interface DocumentRequest {
  customerId: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxCode: string;
  customerType: "INDIVIDUAL" | "ORGANIZATION" | "IMPORTER" | "EXPORTER"; // Match API response
  createdAt: string;
  note?: string;
  dob?: string | null;
  updatedAt?: string;
}

const DocumentRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/customers/document-request");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DocumentRequest[] = await response.json();
      setRequests(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentRequests();
  }, [fetchDocumentRequests]); // Depend on useCallback's stable reference

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumb pageName="Yêu cầu giám định" />
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>Lỗi: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Breadcrumb pageName="Yêu cầu giám định" />
      <div className="mt-4">
        <DocumentRequestTable requests={requests} onRefresh={fetchDocumentRequests} />
      </div>
    </AdminLayout>
  );
};

export default DocumentRequestPage;