"use client";

import AdminLayout from "@/app/admin/component/AdminLayout";
import { FileUploadComponentFormCustomer } from "@/app/admin/component/file-upload/FileUploadComponentFormCustomer";
import React, { useMemo, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

const CreateCustomerDossierPage: React.FC<PageProps> = ({ params }) => {
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
          toast.success("Đã tạo hồ sơ thành công");
          router.push(`/admin/tao-ho-so/${receiptId}`);
        }
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <AdminLayout>
      {parsedCustomerId === null ? (
        <div className="p-10">
          <div className="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Mã khách hàng không hợp lệ. Vui lòng kiểm tra lại đường dẫn.
          </div>
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
    </AdminLayout>
  );
};

export default CreateCustomerDossierPage;
