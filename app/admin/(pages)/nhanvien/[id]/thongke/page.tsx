import AdminLayout from "@/app/admin/component/AdminLayout";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";
import React from "react";
import EmployeeDossierStats from "./EmployeeDossierStats";


export const metadata = {
  title: "BMI - QUẢN LÝ NHÂN VIÊN",
};


const EmployeeDossierStatsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="QUẢN LÝ NHÂN VIÊN" pageHref="/admin/nhanvien" pageNameSecond="THỐNG KÊ XỬ LÝ HỒ SƠ"/>
      <EmployeeDossierStats />
    </AdminLayout>
  );
};

export default EmployeeDossierStatsPage;
