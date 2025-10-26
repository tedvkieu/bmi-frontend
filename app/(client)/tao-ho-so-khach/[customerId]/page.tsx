"use client";

import React, { useMemo, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "../../components/NavbarClient";
import { FileUploadComponentFormCustomer } from "@/app/admin/component/file-upload/FileUploadComponentFormCustomer";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

const CreateCustomerDossierClientPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const resolvedParams = use(params);

  const parsedCustomerId = useMemo(() => {
    const value = Number(resolvedParams?.customerId);
    return Number.isFinite(value) ? value : null;
  }, [resolvedParams?.customerId]);

  const handleUploadSuccess = useCallback(
    (data: any) => {
      if (data && typeof data === "object" && "receiptId" in data) {
        const receiptId = Number((data as { receiptId: number }).receiptId);
        if (Number.isFinite(receiptId)) {
          toast.success("Tải hồ sơ thành công");
          router.push(`/tao-ho-so/${receiptId}`);
          return;
        }
      }
      toast.success("Tải hồ sơ thành công");
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <NavbarClient />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {parsedCustomerId === null ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Không xác định được khách hàng. Vui lòng kiểm tra lại đường dẫn.
          </div>
        ) : (
          <FileUploadComponentFormCustomer
            dossierId={null}
            customerId={parsedCustomerId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={handleCancel}
            loading={loading}
            setLoading={setLoading}
            mode="create"
          />
        )}
      </div>
    </div>
  );
};

export default CreateCustomerDossierClientPage;
