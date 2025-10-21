import React from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import AnalyticDashboard from "./AnalyticDashboard";

export const metadata = {
  title: "BMI - PHÂN TÍCH DỮ LIỆU",
};


const AnalyticPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="PHÂN TÍCH DỮ LIỆU" />

      <AnalyticDashboard />
    </AdminLayout>
  );
};

export default AnalyticPage;
