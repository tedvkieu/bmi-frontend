import React from "react";
import DocumentsContent from "../../component/DocumentContent";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

const DocumentsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Hồ sơ giám định"/>
      <DocumentsContent />
    </AdminLayout>
  );
};

export default DocumentsPage;
