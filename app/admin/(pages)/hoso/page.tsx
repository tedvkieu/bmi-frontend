import React from "react";
import DocumentsContent from "../../component/DocumentContent";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - Hồ sơ dám định",
};


const DocumentsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Hồ sơ giám định"/>
      <DocumentsContent />
    </AdminLayout>
  );
};

export default DocumentsPage;
