import React from "react";
import AdminLayout from "../../component/AdminLayout";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import CustomersContent from "./(component)/CustomersContent";

const ClientsPage = () => {
  return (
    <AdminLayout>
      <Breadcrumb pageName="Khách hàng"/>
      <CustomersContent />
    </AdminLayout>
  );
};
export default ClientsPage;
