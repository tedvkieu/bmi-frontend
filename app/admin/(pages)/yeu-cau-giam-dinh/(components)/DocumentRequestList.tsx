"use client";

import React, { useEffect, useState, useCallback } from "react";
import DocumentRequestTable from "./DocumentRequestTable";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";

interface DocumentRequest {
  customerId: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxCode: string;
  customerType: "IMPORTER" | "SERVICE_MANAGER";
  createdAt: string;
  note?: string;
  dob?: string | null;
  updatedAt?: string;
  draftDossierId?: number | null;
}

const DocumentRequestList: React.FC = () => {
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
  }, [fetchDocumentRequests]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <DocumentRequestTable
      requests={requests}
      onRefresh={fetchDocumentRequests}
    />
  );
};

export default DocumentRequestList;
