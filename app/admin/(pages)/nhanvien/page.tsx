import React from "react";
import AdminLayout from "../../component/AdminLayout";
import UsersClient from "../../component/UsersClient";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";


export const metadata = {
  title: "BMI - QUẢN LÝ NHÂN VIÊN",
};


const UsersPage: React.FC = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="QUẢN LÝ NHÂN VIÊN"/>
      <UsersClient />
    </AdminLayout>
  );
};

export default UsersPage;
