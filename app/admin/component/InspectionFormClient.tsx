"use client";
import React, { useState, useEffect, useCallback } from "react";

import "../styles/InspectionForm.css";
import { InspectionFormData, ReceiptFormData } from "../types/inspection";
import { Customer } from "../types/customer";
import { useParams } from "next/navigation";
import { inspectionApi } from "../services/inspectionApi";
import { ReceiptFormSection } from "./ReceiptFormSection";
import { CompletionSection } from "./CompletionSection";
import { CustomerProfileSection } from "./CustomerProfileSection";
import { MachineryFormSection } from "./MachineSectionForm";
import LoadingSpinner from "./document/LoadingSpinner";

interface MachineryFormData {
  receiptId: number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufactureYear: number;
  quantity: number;
  usage: string;
  note: string;
}

const InspectionFormClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentSection, setCurrentSection] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<number | null>(null);
  const [dossierId, setDossierId] = useState<number | null>(null);

  const [customerProfileData, setCustomerProfileData] =
    useState<InspectionFormData>({
      customerId: 0,
      serviceAddress: "",
      taxCode: "",
      email: "",
      objectType: "SERVICE_MANAGER",
      inspectionTypeId: "",
    });

  const [receiptData, setReceiptData] = useState<ReceiptFormData>({
    registrationNo: "",
    customerSubmitId: 0,
    customerRelatedId: 0,
    inspectionTypeId: "",
    declarationNo: "",
    billOfLading: "",
    shipName: "",
    cout10: 0,
    cout20: 0,
    bulkShip: false,
    declarationDoc: "",
    declarationPlace: "",
    inspectionDate: "",
    certificateDate: "",
    inspectionLocation: "",
    certificateStatus: "PENDING",
  });

  const [machineryData, setMachineryData] = useState<MachineryFormData | null>(
    null
  );

  const fetchDossierAndCustomer = useCallback(async () => {
    if (!id) return;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError("Đường dẫn không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDossierId(numericId);

      const dossierRes = await fetch(`/api/dossiers/${numericId}/details`);
      if (!dossierRes.ok) {
        const payload = await dossierRes.json().catch(() => ({}));
        const message =
          (payload && typeof payload === "object" && "message" in payload
            ? (payload as Record<string, string>).message
            : null) || "Không thể tải thông tin hồ sơ";
        throw new Error(message);
      }

      const dossierData = await dossierRes.json();

      const customerIdStr = dossierData?.customerSubmit?.id;
      const customerId =
        customerIdStr && !Number.isNaN(Number(customerIdStr))
          ? Number(customerIdStr)
          : null;

      if (customerId) {
        const customerRes = await fetch(`/api/customers/${customerId}`);
        if (!customerRes.ok) {
          throw new Error("Không thể tải thông tin khách hàng");
        }
        const customerInfo: Customer = await customerRes.json();
        setCustomer(customerInfo);
        setCustomerProfileData((prev) => ({
          ...prev,
          customerId,
          email: customerInfo.email,
        }));
        setReceiptData((prev) => ({
          ...prev,
          customerSubmitId: customerId,
          customerRelatedId:
            prev.customerRelatedId && prev.customerRelatedId !== 0
              ? prev.customerRelatedId
              : customerId,
        }));
      } else {
        setCustomer(null);
        setCustomerProfileData((prev) => ({
          ...prev,
          customerId: 0,
          email: "",
        }));
        setReceiptData((prev) => ({
          ...prev,
          customerSubmitId: 0,
          customerRelatedId: 0,
        }));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin hồ sơ khách hàng"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDossierAndCustomer();
  }, [fetchDossierAndCustomer]);

  const handleCustomerProfileSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chỉ cần set inspectionTypeId vào receiptData và chuyển section
      setReceiptData((prev) => ({
        ...prev,
        inspectionTypeId: customerProfileData.inspectionTypeId,
      }));

      // Chuyển sang section 2 ngay lập tức
      setCurrentSection(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  const handleReceiptSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // đảm bảo nếu chưa có customerRelatedId thì fallback về customerSubmitId
      const dataToSubmit = {
        ...receiptData,
        customerRelatedId:
          receiptData.customerRelatedId && receiptData.customerRelatedId !== 0
            ? receiptData.customerRelatedId
            : receiptData.customerSubmitId,
      };

      console.log("Data to submit:", dataToSubmit);
      console.log("customerSubmitId:", dataToSubmit.customerSubmitId);
      console.log("customerRelatedId:", dataToSubmit.customerRelatedId);

      const response = await inspectionApi.submitReceipt(dataToSubmit);

      if (response.success) {
        const receiptId = response.data?.receiptId;
        if (receiptId) {
          setReceiptId(receiptId);
          setCurrentSection(3);
        } else {
          throw new Error("Không nhận được mã biên nhận");
        }
      } else {
        throw new Error(response.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi biên nhận"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMachinerySubmit = (machinery: MachineryFormData) => {
    // If the machinery object has manufactureYear, map it to manufactureYear
    const mappedMachinery = {
      ...machinery,
      manufactureYear:
        (machinery as any).manufactureYear ?? machinery.manufactureYear,
    };
    setMachineryData(mappedMachinery);
  };

  // Handler for completing the machinery section and moving to completion
  const handleMachineryComplete = () => {
    setCurrentSection(4);
  };

  if (loading && !customer) {
    return (
     <LoadingSpinner />
    );
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

        {currentSection === 2 && customer && (
          <ReceiptFormSection
            customer={customer}
            formData={receiptData}
            setFormData={setReceiptData}
            onSubmit={handleReceiptSubmit}
            onBack={() => setCurrentSection(1)}
            loading={loading}
          />
        )}

        {currentSection === 3 && receiptId && (
          <MachineryFormSection
            receiptId={receiptId}
            registrationNo={receiptData.registrationNo}
            onSubmit={handleMachinerySubmit}
            onBack={() => setCurrentSection(2)}
            onComplete={handleMachineryComplete}
            loading={loading}
          />
        )}

        {currentSection === 4 && (
          <CompletionSection
            customerData={customerProfileData}
            receiptData={receiptData}
            machineryData={machineryData}
          />
        )}
      </div>
    </div>
  );
};

export default InspectionFormClient;
