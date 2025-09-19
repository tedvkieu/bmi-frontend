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

const InspectionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentSection, setCurrentSection] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<number | null>(null);

  const [customerProfileData, setCustomerProfileData] =
    useState<InspectionFormData>({
      customerId: Number(id),
      serviceAddress: "",
      taxCode: "",
      email: "",
      objectType: "SERVICE_MANAGER",
      inspectionTypeId: "",
    });

  const [receiptData, setReceiptData] = useState<ReceiptFormData>({
    registrationNo: "",
    customerSubmitId: Number(id) || 0,
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

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) {
        throw new Error("Lỗi khi gọi API");
      }

      const customer: Customer = await res.json();

      setCustomer(customer);
      setCustomerProfileData((prev) => ({
        ...prev,
        email: customer.email,
      }));
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  }, [id]); // 👈 dependency

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id, fetchCustomer]);

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
      <div className="inspection-form-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="inspection-form-container">
      <div className="inspection-form-header">
        <h1>Tạo Hồ Sơ Kiểm Tra</h1>
        <div className="progress-indicator">
          <div
            className={`step ${currentSection >= 1 ? "active" : ""} ${
              currentSection > 1 ? "completed" : ""
            }`}
          >
            <span className="step-number">1</span>
            <span className="step-label">Hồ sơ khách hàng</span>
          </div>
          <div
            className={`step ${currentSection >= 2 ? "active" : ""} ${
              currentSection > 2 ? "completed" : ""
            }`}
          >
            <span className="step-number">2</span>
            <span className="step-label">Thông tin biên nhận</span>
          </div>
          <div
            className={`step ${currentSection >= 3 ? "active" : ""} ${
              currentSection > 3 ? "completed" : ""
            }`}
          >
            <span className="step-number">3</span>
            <span className="step-label">Máy móc giám định</span>
          </div>
          <div className={`step ${currentSection >= 4 ? "active" : ""}`}>
            <span className="step-number">4</span>
            <span className="step-label">Hoàn thành</span>
          </div>
        </div>
      </div>

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
            formData={customerProfileData}
            setFormData={setCustomerProfileData}
            onSubmit={handleCustomerProfileSubmit}
            loading={loading}
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

export default InspectionForm;
