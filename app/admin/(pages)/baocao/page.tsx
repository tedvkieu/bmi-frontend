import React from "react";
import AdminLayout from "../../component/AdminLayout";
import ReportsClient from "../../component/ReportsClient";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

const ReportsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Báo cáo"/>
      <ReportsClient />
    </AdminLayout>
  );
};

export default ReportsPage;
