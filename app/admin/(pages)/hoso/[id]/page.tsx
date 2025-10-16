import React from "react";
import DossierDetail from "../(components)/DossierDetails";
import AdminLayout from "@/app/admin/component/AdminLayout";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - Chi tiết yêu cầu dám định",
};


const DocumentsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Hồ sơ giám định" pageHref="/admin/hoso" pageNameSecond="Thông tin chi tiết"/>
      <DossierDetail />
    </AdminLayout>
  );
};

export default DocumentsPage;
