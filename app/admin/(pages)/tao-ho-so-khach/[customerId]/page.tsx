"use client";

import AdminLayout from "@/app/admin/component/AdminLayout";
import { CustomerProfileSection } from "@/app/admin/component/CustomerProfileSection";
import LoadingSpinner from "@/app/admin/component/document/LoadingSpinner";
import { FileUploadComponentFormCustomer } from "@/app/admin/component/file-upload/FileUploadComponentFormCustomer";
import { InspectionFormData } from "@/app/admin/types/inspection";
import { Customer as CustomerType } from "@/app/admin/types/customer";
import React, { useMemo, useState, useCallback, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

const CreateCustomerDossierPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InspectionFormData>({
    customerId: 0,
    serviceAddress: "",
    taxCode: "",
    email: "",
    objectType: "SERVICE_MANAGER",
    inspectionTypeId: "",
  });

  const resolvedParams = use(params);

  const parsedCustomerId = useMemo(() => {
    const value = Number(resolvedParams?.customerId);
    return Number.isFinite(value) ? value : null;
  }, [resolvedParams?.customerId]);

  useEffect(() => {
    if (parsedCustomerId === null) {
      setCustomer(null);
      return;
    }

    let ignore = false;
    const fetchCustomer = async () => {
      try {
        setFetchingCustomer(true);
        setError(null);
        const response = await fetch(`/api/customers/${parsedCustomerId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Không thể tải thông tin khách hàng");
        }
        const data: CustomerType = await response.json();
        if (ignore) return;
        setCustomer(data);
        setFormData((prev) => ({
          ...prev,
          customerId: data.customerId,
          email: data.email ?? "",
          taxCode: data.taxCode ?? "",
          serviceAddress: data.address ?? "",
          objectType:
            data.customerType === "IMPORTER" ? "IMPORTER" : "SERVICE_MANAGER",
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin khách hàng";
        if (!ignore) {
          setCustomer(null);
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!ignore) {
          setFetchingCustomer(false);
        }
      }
    };

    fetchCustomer();
    return () => {
      ignore = true;
    };
  }, [parsedCustomerId]);

  const handleUploadSuccess = useCallback(
    (data: any) => {
      if (data && typeof data === "object" && "receiptId" in data) {
        const receiptId = Number((data as { receiptId: number }).receiptId);
        if (Number.isFinite(receiptId)) {
          toast.success("Đã tạo hồ sơ thành công");
          router.push(`/admin/tao-ho-so/${receiptId}`);
        }
      }
    },
    [router]
  );

  const renderUploadComponent = useCallback(
    ({
      dossierId,
      onUploadSuccess,
      onCancel,
      loading,
      setLoading,
      uploadMode,
    }: {
      dossierId: number | null;
      onUploadSuccess?: (data: any) => void;
      onCancel: () => void;
      loading: boolean;
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
      uploadMode: "create" | "update";
    }) => (
      <FileUploadComponentFormCustomer
        dossierId={dossierId}
        customerId={parsedCustomerId ?? undefined}
        onUploadSuccess={(data) => {
          handleUploadSuccess(data);
          onUploadSuccess?.(data);
        }}
        onCancel={onCancel}
        loading={loading}
        setLoading={(value: boolean) => setLoading(value)}
        mode={uploadMode}
      />
    ),
    [parsedCustomerId, handleUploadSuccess]
  );

  return (
    <AdminLayout>
      {parsedCustomerId === null ? (
        <div className="p-10">
          <div className="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Mã khách hàng không hợp lệ. Vui lòng kiểm tra lại đường dẫn.
          </div>
        </div>
      ) : (
        <div className="p-4 lg:p-8 space-y-6">
          {error && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
              {error}
            </div>
          )}
          {fetchingCustomer && !customer ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : customer ? (
            <CustomerProfileSection
              customer={customer}
              dossierId={null}
              formData={formData}
              setFormData={setFormData}
              onSubmit={() => undefined}
              loading={fetchingCustomer}
              onUploadSuccess={handleUploadSuccess}
              uploadMode="create"
              renderUploadComponent={renderUploadComponent}
            />
          ) : (
            <div className="p-10">
              <div className="max-w-xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-700">
                Không tìm thấy thông tin khách hàng. Vui lòng thử lại sau.
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default CreateCustomerDossierPage;
