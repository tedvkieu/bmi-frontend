import React from "react";
import AdminLayout from "../../component/AdminLayout";
import UsersClient from "../../component/UsersClient";

const UsersPage: React.FC = () => {
  return (
    <AdminLayout>
      <UsersClient />
    </AdminLayout>
  );
};

export default UsersPage;
