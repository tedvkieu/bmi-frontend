import React from "react";
import AdminLayout from "../../component/AdminLayout";
import UsersClient from "../../component/UsersClient";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";

const UsersPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Quản lý nhân viên"/>
      <UsersClient />
    </AdminLayout>
  );
};

export default UsersPage;
