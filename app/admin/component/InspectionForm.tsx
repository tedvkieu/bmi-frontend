"use client";
import React, { useState, useEffect, useCallback } from "react";

import "../styles/InspectionForm.css";
import { InspectionFormData } from "../types/inspection";
import { Customer } from "../types/customer";
import { useParams } from "next/navigation";
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

      const dossierResponse = await fetch(
        `/api/dossiers/${numericId}/details`
      );

      if (!dossierResponse.ok) {
        const errorPayload = await dossierResponse
          .json()
          .catch(() => ({ message: "" }));
        const message =
          (errorPayload && (errorPayload as { message?: string }).message) ||
          "Không thể tải thông tin hồ sơ. Vui lòng tạo hồ sơ trước.";
        throw new Error(message);
      }

      const dossierData: DossierDetails = await dossierResponse.json();

      setDossierId(numericId);

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
  }, [id]);

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
            uploadMode="update"
          />
        )}
      </div>
    </div>
  );
};

export default InspectionForm;
