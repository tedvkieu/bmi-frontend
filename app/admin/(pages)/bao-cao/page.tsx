import React from "react";
import AdminLayout from "../../component/AdminLayout";
import ReportsClient from "../../component/ReportsClient";

const ReportsPage: React.FC = () => {
  return (
    <AdminLayout>
      <ReportsClient />
    </AdminLayout>
  );
};

export default ReportsPage;
