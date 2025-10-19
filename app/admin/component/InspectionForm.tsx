"use client";
import React, { useState, useEffect, useCallback } from "react";

import "../styles/InspectionForm.css";
import { InspectionFormData } from "../types/inspection";
import { Customer } from "../types/customer";
import { useParams, useRouter } from "next/navigation";
import { CustomerProfileSection } from "./CustomerProfileSection";
import LoadingSpinner from "./document/LoadingSpinner";
import toast from "react-hot-toast";

interface DossierCustomerSummary {
  id?: string;
  name?: string;
  address?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
}

interface DossierDetails {
  dossierId: number;
  registrationNo?: string;
  customerSubmit?: DossierCustomerSummary | null;
}

const InspectionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [dossierId, setDossierId] = useState<number | null>(null);

  const [currentSection, setCurrentSection] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerProfileData, setCustomerProfileData] =
    useState<InspectionFormData>({
      customerId: 0,
      serviceAddress: "",
      taxCode: "",
      email: "",
      objectType: "SERVICE_MANAGER",
      inspectionTypeId: "",
    });

  const fetchCustomerAndDossier = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        throw new Error("Đường dẫn không hợp lệ");
      }

      let resolvedDossierId = numericId;
      let dossierData: DossierDetails | null = null;

      const dossierResponse = await fetch(
        `/api/dossiers/${numericId}/details`
      );

      if (dossierResponse.ok) {
        dossierData = await dossierResponse.json();
      } else if (dossierResponse.status === 404) {
        const draftResponse = await fetch(
          `/api/dossiers/customer/${numericId}/draft`,
          { method: "POST" }
        );

        if (!draftResponse.ok) {
          throw new Error("Không thể khởi tạo hồ sơ mới từ khách hàng");
        }

        const draftData: { receiptId?: number } = await draftResponse.json();
        if (!draftData?.receiptId) {
          throw new Error("Dữ liệu trả về không hợp lệ khi tạo hồ sơ");
        }

        resolvedDossierId = draftData.receiptId;

        const createdDossierResponse = await fetch(
          `/api/dossiers/${resolvedDossierId}/details`
        );

        if (!createdDossierResponse.ok) {
          throw new Error("Không thể tải thông tin hồ sơ vừa tạo");
        }

        dossierData = await createdDossierResponse.json();
        toast.success("Đã khởi tạo hồ sơ nháp cho khách hàng");

        if (String(resolvedDossierId) !== id) {
          router.replace(`/admin/hoso/tao-ho-so/${resolvedDossierId}`);
        }
      } else {
        const errorPayload = await dossierResponse
          .json()
          .catch(() => ({ message: "" }));
        const message =
          errorPayload?.message || "Không thể tải thông tin hồ sơ";
        throw new Error(message);
      }

      setDossierId(resolvedDossierId);

      if (!dossierData) {
        throw new Error("Không thể xác định thông tin hồ sơ");
      }

      const customerIdStr = dossierData.customerSubmit?.id;
      const parsedCustomerId = customerIdStr ? Number(customerIdStr) : NaN;

      if (!Number.isNaN(parsedCustomerId)) {
        const customerResponse = await fetch(
          `/api/customers/${parsedCustomerId}`
        );
        if (!customerResponse.ok) {
          throw new Error("Không thể tải thông tin khách hàng");
        }
        const customerData: Customer = await customerResponse.json();
        setCustomer(customerData);
        setCustomerProfileData((prev) => ({
          ...prev,
          customerId: parsedCustomerId,
          email: customerData.email,
        }));
      } else {
        setCustomer(null);
        setCustomerProfileData((prev) => ({
          ...prev,
          customerId: 0,
          email: "",
        }));
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin hồ sơ khách hàng";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchCustomerAndDossier();
    }
  }, [id, fetchCustomerAndDossier]);

  const handleCustomerProfileSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentSection(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !customer) {
    return <LoadingSpinner />;
  }

  return (
    <div className="inspection-form-container">
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          {error}
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Đóng thông báo lỗi"
          >
            ×
          </button>
        </div>
      )}

      <div className="inspection-form-content">
        {currentSection === 1 && (
          <CustomerProfileSection
            customer={customer}
            dossierId={dossierId}
            formData={customerProfileData}
            setFormData={setCustomerProfileData}
            onSubmit={handleCustomerProfileSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default InspectionForm;
