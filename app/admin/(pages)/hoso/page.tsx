import React from "react";
import DocumentsContent from "../../component/DocumentContent";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - GIÁM SÁT / QUẢN LÝ HỒ SƠ",
};


const DocumentsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="GIÁM SÁT / QUẢN LÝ HỒ SƠ"/>
      <DocumentsContent />
    </AdminLayout>
  );
};

export default DocumentsPage;
