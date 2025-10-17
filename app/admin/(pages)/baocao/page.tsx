import React from "react";
import AdminLayout from "../../component/AdminLayout";
import ReportsClient from "../../component/ReportsClient";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

export const metadata = {
  title: "BMI - TỔNG HỢP & XUẤT BÁO CÁO",
};


const ReportsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="TỔNG HỢP & XUẤT BÁO CÁO"/>
      <ReportsClient />
    </AdminLayout>
  );
};

export default ReportsPage;
