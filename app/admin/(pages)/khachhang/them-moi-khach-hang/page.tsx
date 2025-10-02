import AdminLayout from "@/app/admin/component/AdminLayout";
import Breadcrumb from "@/app/admin/component/breadcrumb/Breadcrumb";
import React from "react";
import AddCustomerForm from "./components/AddCustomerForm";

export default function AddCustomer() {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Khách hàng" pageNameSecond="Tạo khách hàng mới" pageHref="/admin/khachhang"/>
      <AddCustomerForm />
    </AdminLayout>
  );
}

