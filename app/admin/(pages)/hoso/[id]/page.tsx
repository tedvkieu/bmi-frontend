import React from "react";
import DossierDetail from "../(components)/DossierDetails";
import AdminLayout from "@/app/admin/component/AdminLayout";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - CHỈNH SỬA HỒ SƠ GIÁM ĐỊNH",
};


const DocumentsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="GIÁM SÁT / QUẢN LÝ HỒ SƠ" pageHref="/admin/hoso" pageNameSecond="CHỈNH SỬA HỒ SƠ GIÁM ĐỊNH"/>
      <DossierDetail />
    </AdminLayout>
  );
};

export default DocumentsPage;
