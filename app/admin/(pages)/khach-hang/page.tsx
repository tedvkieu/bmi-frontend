// app/khach-hang/page.tsx
import React from "react";
import AdminLayout from "../../component/AdminLayout";
import CustomersContent from "../../component/CustomerPageContent";

const ClientsPage = () => {
  return (
    <AdminLayout>
      <CustomersContent />
    </AdminLayout>
  );
};

export default ClientsPage;
