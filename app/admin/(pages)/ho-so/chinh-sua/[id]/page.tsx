// app/tai-lieu-giam-dinh/page.tsx
import AdminLayout from "@/app/admin/component/AdminLayout";
import EditDocumentContent from "@/app/admin/component/EditDocumentContent";
import React from "react";

const DocumentsPage = () => {
  return (
    <AdminLayout>
      <EditDocumentContent />
    </AdminLayout>
  );
};

export default DocumentsPage;
